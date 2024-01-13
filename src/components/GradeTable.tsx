import React, { FC, useState } from "react";
import { StudentFinalGrade } from "../types/api_types";
import {
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
} from "@mui/material";

export const GradeTable: FC<{ studentFinalGrades: StudentFinalGrade[]; loading: boolean }> = ({ studentFinalGrades, loading }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleChangePage = (_event: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = Math.max(0, (page + 1) * rowsPerPage - studentFinalGrades.length);

  return (
    <TableContainer component={Paper}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {['Student ID', 'Name', 'Class ID', 'Class Name', 'Semester', 'Final Grade'].map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} style={{ textAlign: 'center' }}>
                <CircularProgress />
              </TableCell>
            </TableRow>
          ) : (
            studentFinalGrades.slice(page * rowsPerPage, (page + 1) * rowsPerPage).map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.student.universityId}</TableCell>
                <TableCell>{item.student.name}</TableCell>
                <TableCell>{item.class.classId}</TableCell>
                <TableCell>{item.class.title}</TableCell>
                <TableCell>{item.class.semester}</TableCell>
                <TableCell>{item.finalGrade.toFixed(2)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={studentFinalGrades.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </TableContainer>
  );
};
