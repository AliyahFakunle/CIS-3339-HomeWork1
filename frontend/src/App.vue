<template>
  <div>
    <h1>Student Management System</h1>
    <nav>
      <RouterLink to="/students">Students</RouterLink> |
      <RouterLink to="/courses">Courses</RouterLink> |
      <RouterLink to="/enrollments">Enrollments</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>