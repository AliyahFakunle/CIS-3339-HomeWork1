<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSchoolStore } from '../stores/schoolStore';

const store = useSchoolStore();
const { students, courses } = storeToRefs(store);

const studentId = ref('');
const courseId = ref('');
const selectedCourse = ref('');
const enrolledStudents = ref([]);
const message = ref('');
const searched = ref(false);

async function loadData() {
  try {
    await store.loadData();
  } catch (error) {
    message.value = error.message;
  }
}

async function enrollStudent() {
  message.value = '';

  try {
    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        studentId: studentId.value,
        courseId: courseId.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Enrollment failed');
    }

    message.value = 'Student enrolled successfully!';

    selectedCourse.value = courseId.value;
    studentId.value = '';
    courseId.value = '';

    await showEnrolledStudents();
  } catch (error) {
    message.value = error.message;
  }
}

async function showEnrolledStudents() {
  try {
    const response = await fetch(
      `/api/courses/${selectedCourse.value}/students`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to load students');
    }

    enrolledStudents.value = data;
    searched.value = true;
  } catch (error) {
    enrolledStudents.value = [];
    message.value = error.message;
  }
}

onMounted(loadData);
</script>

<template>
  <section class="enrollment-page">
    <h2>Enrollment Management</h2>
    <p>Enroll students in courses and view enrolled students.</p>

    <h3>Enroll a Student</h3>

    <form @submit.prevent="enrollStudent">
      <label>Select Student</label>

      <select v-model="studentId" required>
        <option disabled value="">Choose a student</option>

        <option
          v-for="student in students"
          :key="student._id"
          :value="student._id"
        >
          {{ student.name }} - {{ student.id }}
        </option>
      </select>

      <label>Select Course</label>

      <select v-model="courseId" required>
        <option disabled value="">Choose a course</option>

        <option
          v-for="course in courses"
          :key="course._id"
          :value="course._id"
        >
          {{ course.id }} - {{ course.name }}
        </option>
      </select>

      <button type="submit">Enroll Student</button>
    </form>

    <p v-if="message">{{ message }}</p>

    <hr />

    <h3>View Enrolled Students</h3>

    <form @submit.prevent="showEnrolledStudents">
      <label>Select Course</label>

      <select
        v-model="selectedCourse"
        @change="searched = false"
        required
      >
        <option disabled value="">Choose a course</option>

        <option
          v-for="course in courses"
          :key="course._id"
          :value="course._id"
        >
          {{ course.id }} - {{ course.name }}
        </option>
      </select>

      <button type="submit">
        Show Enrolled Students
      </button>
    </form>

    <p v-if="searched && enrolledStudents.length === 0">
      No students enrolled in this course.
    </p>

    <table v-if="searched && enrolledStudents.length > 0">
      <thead>
        <tr>
          <th>Student ID</th>
          <th>Name</th>
          <th>Phone</th>
          <th>ZIP Code</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="student in enrolledStudents"
          :key="student._id"
        >
          <td>{{ student.id }}</td>
          <td>{{ student.name }}</td>
          <td>{{ student.phone }}</td>
          <td>{{ student.zip }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.enrollment-page {
  max-width: 800px;
  margin: 20px auto;
  text-align: left;
}

form {
  display: flex;
  flex-direction: column;
  max-width: 350px;
  gap: 10px;
}

select {
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
}

hr {
  margin: 30px 0;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #777;
  padding: 12px;
  text-align: left;
}
</style>
