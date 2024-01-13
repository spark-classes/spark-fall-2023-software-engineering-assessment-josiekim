/**
 * This file contains some function stubs(ie incomplete functions) that
 * you MUST use to begin the work for calculating the grades.
 *
 * You may need more functions than are currently here...we highly encourage you to define more.
 *
 * Anything that has a type of "undefined" you will need to replace with something.
 */
import { IAssignment, IGrade, IStudent, IUniversityClass, StudentStatus } from "../types/api_types";
import { MY_BU_ID, BASE_API_URL, GET_DEFAULT_HEADERS } from "../globals";

export const fetchStudentsFromClass = async (classID: string): Promise<string[]> => {
  console.log("fetchStudentsFromClass", classID);

  const res = await fetch(`${BASE_API_URL}/class/listStudents/${classID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
};

export const fetchStudentById = async (studentID: string): Promise<IStudent> => {
  const res = await fetch(`${BASE_API_URL}/student/GetById/${studentID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const response = await res.json();
  return Array.isArray(response) ? response[0] : response;
};

export const fetchAssignments = async (classID: string): Promise<IAssignment[]> => {
  const response = await fetch(`${BASE_API_URL}/class/listAssignments/${classID}?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const fetchGrades = async (studentID: string, classID: string): Promise<IGrade> => {
  console.log("fetchGrades", studentID, classID)
  const res = await fetch(`${BASE_API_URL}/student/listGrades/${studentID}/${classID}/?buid=${MY_BU_ID}`, {
    method: "GET",
    headers: GET_DEFAULT_HEADERS(),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const response = await res.json();
  return Array.isArray(response) ? response[0] : response;
};

/**
 * This function might help you write the function below.
 * It retrieves the final grade for a single student based on the passed params.
 * 
 * If you are reading here and you haven't read the top of the file...go back.
 */

// calculate_grades.ts
export async function calculateStudentFinalGrade(
  studentGrades: IGrade,
  classAssignments: IAssignment[],
): Promise<number> {
  let weightedSum = 0;
  let totalWeight = 0;

  const gradesObject = studentGrades.grades[0] as unknown as Record<string, string>;


  for (const assignment of classAssignments) {
    const gradeStr = gradesObject[assignment.assignmentId];
    const grade = parseFloat(gradeStr || "0");
    const weight = assignment.weight;

    weightedSum += grade * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}


/**
 * You need to write this function! You might want to write more functions to make the code easier to read as well.
 * 
 *  If you are reading here and you haven't read the top of the file...go back.
 * 
 * @param classID The ID of the class for which we want to calculate the final grades
 * @returns Some data structure that has a list of each student and their final grade.
 */
export async function calcAllFinalGrade(classInfo: IUniversityClass): Promise<{ class: IUniversityClass, student: IStudent, finalGrade: number }[]> {
  const students = await fetchStudentsFromClass(classInfo.classId);
  const assignments = await fetchAssignments(classInfo.classId);

  const studentsFinalGradesPromises = students.map(async (studentID: string) => {
    try {
      const grades = await fetchGrades(studentID, classInfo.classId);
      const finalGrade = await calculateStudentFinalGrade(grades, assignments);
      const student = await fetchStudentById(studentID);

      return { class: classInfo, student, finalGrade };
    } catch (error) {
       //dummy student
      const dummyStudent: IStudent = {
        dateEnrolled: "N/A",
        name: "Unknown",
        status: StudentStatus.UNENROLLED,
        universityId: "N/A",
      };
      console.error(`Failed to get grades for student ${studentID}:`, error);
      return { class: classInfo, student: dummyStudent , finalGrade: 0 };
    }
  });

  return Promise.all(studentsFinalGradesPromises);
}
