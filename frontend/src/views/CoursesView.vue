<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useSchoolStore } from '../stores/schoolStore';

const store = useSchoolStore();
const { courses } = storeToRefs(store);

const id = ref('');
const name = ref('');
const message = ref('');

async function loadCourses() {
  try {
    await store.loadCourses();
  } catch (error) {
    message.value = error.message;
  }
}

async function addCourse() {
  message.value = '';

  try {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: id.value.trim(),
        name: name.value.trim()
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to add course');
    }

    message.value = 'Course added successfully!';
    id.value = '';
    name.value = '';

    await loadCourses();
  } catch (error) {
    message.value = error.message;
  }
}

async function deleteCourse(courseId) {
  if (!confirm('Are you sure you want to delete this course?')) {
    return;
  }

  try {
    const response = await fetch(
      `/api/courses/${encodeURIComponent(courseId)}`,
      { method: 'DELETE' }
    );

    if (!response.ok) {
      throw new Error('Failed to delete course');
    }

    message.value = 'Course deleted successfully!';
    await loadCourses();
  } catch (error) {
    message.value = error.message;
  }
}

onMounted(loadCourses);
</script>

<template>
  <section class="course-page">
    <h2>Course Management</h2>
    <p>Add, view, and delete courses.</p>

    <h3>Add a Course</h3>

    <form @submit.prevent="addCourse">
      <label>Course ID</label>
      <input v-model="id" required />

      <label>Course Name</label>
      <input v-model="name" required />

      <button type="submit">Add Course</button>
    </form>

    <p v-if="message">{{ message }}</p>

    <h3>Course Records</h3>

    <button @click="loadCourses">Show All Courses</button>

    <p v-if="courses.length === 0">
      No courses found.
    </p>

    <table v-else>
      <thead>
        <tr>
          <th>Course ID</th>
          <th>Course Name</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="course in courses" :key="course._id">
          <td>{{ course.id }}</td>
          <td>{{ course.name }}</td>
          <td>
            <button @click="deleteCourse(course._id)">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.course-page {
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

input {
  padding: 10px;
  font-size: 16px;
}

button {
  padding: 10px 15px;
  margin: 5px;
  cursor: pointer;
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