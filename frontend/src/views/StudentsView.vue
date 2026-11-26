
<script setup>
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSchoolStore } from '../stores/schoolStore'

const store = useSchoolStore()
const { students } = storeToRefs(store)

const name = ref('')
const id = ref('')
const phone = ref('')
const zip = ref('')
const searchName = ref('')
const message = ref('')
const error = ref('')
const loading = ref(false)
const searchResults = ref(null)

const displayedStudents = computed(() =>
  searchResults.value ?? students.value
)

async function request(url, options = {}) {
  const response = await fetch(url, options)
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

async function loadStudents() {
  loading.value = true
  error.value = ''

  try {
    await store.loadStudents()
    searchResults.value = null
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function addStudent() {
  message.value = ''
  error.value = ''

  if (![name.value, id.value, phone.value, zip.value]
      .every(value => value.trim())) {
    error.value = 'All fields are required.'
    return
  }

  loading.value = true

  try {
    await request('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name.value,
        id: id.value,
        phone: phone.value,
        zip: zip.value
      })
    })

    name.value = ''
    id.value = ''
    phone.value = ''
    zip.value = ''
    searchName.value = ''

    message.value = 'Student added successfully!'
    await loadStudents()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function searchStudents() {
  if (!searchName.value.trim()) {
    await loadStudents()
    return
  }

  loading.value = true
  error.value = ''
  message.value = ''

  try {
    searchResults.value = await request(
      '/api/students/search?name=' +
      encodeURIComponent(searchName.value)
    )
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function deleteStudent(student) {
  if (!confirm(`Delete ${student.name}?`)) return

  message.value = ''
  error.value = ''
  loading.value = true

  try {
    await request(`/api/students/${student._id}`, {
      method: 'DELETE'
    })

    message.value = 'Student deleted successfully!'
    searchName.value = ''
    await loadStudents()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(loadStudents)
</script>

<template>
  <section class="student-page">
    <h2>Student Management</h2>
    <p>Add, search, view, and delete students.</p>

    <h3>Add a Student</h3>

    <form @submit.prevent="addStudent">
      <div>
        <label for="student-name">Name</label>
        <input id="student-name" v-model="name" required />
      </div>

      <div>
        <label for="student-id">Student ID</label>
        <input id="student-id" v-model="id" required />
      </div>

      <div>
        <label for="student-phone">Phone</label>
        <input id="student-phone" v-model="phone" required />
      </div>

      <div>
        <label for="student-zip">ZIP Code</label>
        <input id="student-zip" v-model="zip" required />
      </div>

      <button type="submit" :disabled="loading">
        Add Student
      </button>
    </form>

    <h3>Search Students</h3>

    <form @submit.prevent="searchStudents">
      <label for="search-name">Student Name</label>
      <input id="search-name" v-model="searchName" />

      <button type="submit" :disabled="loading">
        Search
      </button>

      <button
        type="button"
        @click="searchName = ''; loadStudents()"
      >
        Show All
      </button>
    </form>

    <p v-if="message" role="status">{{ message }}</p>
    <p v-if="error" role="alert">{{ error }}</p>
    <p v-if="loading">Loading...</p>

    <h3>Student Records</h3>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Phone</th>
            <th>ZIP</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="student in displayedStudents"
            :key="student._id"
          >
            <td>{{ student.name }}</td>
            <td>{{ student.id }}</td>
            <td>{{ student.phone }}</td>
            <td>{{ student.zip }}</td>
            <td>
              <button
                type="button"
                @click="deleteStudent(student)"
                :disabled="loading"
              >
                Delete
              </button>
            </td>
          </tr>

          <tr v-if="!loading && displayedStudents.length === 0">
            <td colspan="5">No students found.</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.student-page {
  max-width: 850px;
  margin: 0 auto;
  text-align: left;
  padding: 20px;
}

form {
  margin-bottom: 25px;
}

form div {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  padding: 10px;
  width: min(100%, 320px);
  box-sizing: border-box;
}

button {
  margin: 5px;
  padding: 10px 16px;
  cursor: pointer;
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  border: 1px solid #777;
  padding: 10px;
  text-align: left;
}
</style>
