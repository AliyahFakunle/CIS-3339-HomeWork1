
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const Student = require('./models/Student');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

function handleError(res, error) {
  console.error(error);

  if (error.code === 11000) {
    return res.status(409).json({
      error: 'This record already exists.'
    });
  }

  if (error.name === 'ValidationError' ||
      error.name === 'CastError') {
    return res.status(400).json({
      error: error.message
    });
  }

  return res.status(500).json({
    error: 'Internal server error'
  });
}

function validText(...values) {
  return values.every(
    value => typeof value === 'string' && value.trim()
  );
}

// STUDENT MANAGEMENT

app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ name: 1 });
    res.json(students);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { name, id, phone, zip } = req.body;

    if (!validText(name, id, phone, zip)) {
      return res.status(400).json({
        error: 'All student fields are required.'
      });
    }

    const student = await Student.create({
      name, id, phone, zip
    });

    res.status(201).json({
      message: 'Student added successfully',
      student
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/students/search', async (req, res) => {
  try {
    const name = req.query.name;

    if (!validText(name)) {
      return res.status(400).json({
        error: 'Student name is required.'
      });
    }

    const students = await Student.find({
      name: { $regex: escapeRegex(name.trim()), $options: 'i' }
    });

    res.json(students);
  } catch (error) {
    handleError(res, error);
  }
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        error: 'Student not found.'
      });
    }

    await Enrollment.deleteMany({ student: student._id });
    await Student.deleteOne({ _id: student._id });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

// COURSE MANAGEMENT

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ id: 1 });
    res.json(courses);
  } catch (error) {
    handleError(res, error);
  }
});

app.post('/api/courses', async (req, res) => {
  try {
    const { id, name } = req.body;

    if (!validText(id, name)) {
      return res.status(400).json({
        error: 'Course ID and name are required.'
      });
    }

    const course = await Course.create({ id, name });

    res.status(201).json({
      message: 'Course added successfully',
      course
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found.'
      });
    }

    await Enrollment.deleteMany({ course: course._id });
    await Course.deleteOne({ _id: course._id });

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

// ENROLLMENT MANAGEMENT

app.post('/api/enrollments', async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        error: 'Student and course are required.'
      });
    }

    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student || !course) {
      return res.status(404).json({
        error: 'Student or course not found.'
      });
    }

    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id
    });

    res.status(201).json({
      message: 'Enrollment created successfully',
      enrollment
    });
  } catch (error) {
    handleError(res, error);
  }
});

app.get('/api/courses/:id/students', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        error: 'Course not found.'
      });
    }

    const enrollments = await Enrollment.find({
      course: course._id
    }).populate('student');

    res.json(
      enrollments
        .filter(item => item.student)
        .map(item => item.student)
    );
  } catch (error) {
    handleError(res, error);
  }
});

// PRODUCTION FRONTEND

const distPath = path.join(__dirname, '../frontend/dist');

app.use(express.static(distPath));

app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// DATABASE CONNECTION AND SERVER STARTUP

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Promise.all([
      Student.init(),
      Course.init(),
      Enrollment.init()
    ]);

    console.log('MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Startup failed:', error);
    process.exit(1);
  }
}

startServer();
