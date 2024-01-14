import { useEffect, useState } from "react";
import { Grid, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { BASE_API_URL, GET_DEFAULT_HEADERS, MY_BU_ID } from "./globals";
import { IUniversityClass, StudentFinalGrade } from "./types/api_types";
import { GradeTable } from "./components/GradeTable";
import { calcAllFinalGrade } from "./utils/calculate_grade";

const fetchData = async (url: string) => {
  const response = await fetch(url, { method: "GET", headers: GET_DEFAULT_HEADERS() });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

const App = () => {
  const [currClass, setCurrClass] = useState<IUniversityClass | null>(null);
  const [classList, setClassList] = useState<IUniversityClass[]>([]);
  const [finalGrades, setFinalGrades] = useState<StudentFinalGrade[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClassList = async () => setClassList(await fetchData(`${BASE_API_URL}/class/listBySemester/fall2022?buid=${MY_BU_ID}`));

  const fetchClass = async (classID: string) => fetchData(`${BASE_API_URL}/class/GetById/${classID}?buid=${MY_BU_ID}`);

  useEffect(() => { fetchClassList(); }, []);

  const handleClassSelection = async (event: SelectChangeEvent<string>) => {
    const selectedClassId = event.target.value;
    try {
      setLoading(true);
      const selectedClass = await fetchClass(selectedClassId);
      setCurrClass(selectedClass);
      setFinalGrades(await calcAllFinalGrade(selectedClass));
      setLoading(false);
    } catch (error) { console.error("Error in class selection:", error); }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        <Grid xs={12} container alignItems="center" justifyContent="center">
          <Typography variant="h2" gutterBottom>Spark Assessment</Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h4" gutterBottom>Select a class</Typography>
          <Select fullWidth value={currClass?.classId || ""} onChange={handleClassSelection}>
            {classList.map(({ classId, title }) => <MenuItem key={classId} value={classId}>{title}</MenuItem>)}
          </Select>
        </Grid>
        <Grid xs={12} md={8}>
          <Typography variant="h4" gutterBottom>Final Grades</Typography>
          <GradeTable studentFinalGrades={finalGrades} loading={loading} />
        </Grid>
      </Grid>
    </div>
  );
};

export default App;
