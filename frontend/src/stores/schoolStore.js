
import { defineStore } from 'pinia';

export const useSchoolStore = defineStore('school', {
  state: () => ({
    students: [],
    courses: []
  }),

  actions: {
    async loadStudents() {
      const response = await fetch('/api/students');

      if (!response.ok) {
        throw new Error('Failed to load students');
      }

      this.students = await response.json();
    },

    async loadCourses() {
      const response = await fetch('/api/courses');

      if (!response.ok) {
        throw new Error('Failed to load courses');
      }

      this.courses = await response.json();
    },

    async loadData() {
      await Promise.all([
        this.loadStudents(),
        this.loadCourses()
      ]);
    }
  }
});
