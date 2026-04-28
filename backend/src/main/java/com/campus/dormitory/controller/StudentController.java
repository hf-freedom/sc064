package com.campus.dormitory.controller;

import com.campus.dormitory.common.Result;
import com.campus.dormitory.entity.Student;
import com.campus.dormitory.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @GetMapping
    public Result<List<Student>> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{studentId}")
    public Result<Student> getStudentById(@PathVariable String studentId) {
        return studentService.getStudentById(studentId);
    }

    @PostMapping
    public Result<Student> addStudent(@RequestBody Student student) {
        return studentService.addStudent(student);
    }

    @PutMapping("/{studentId}")
    public Result<Student> updateStudent(@PathVariable String studentId, @RequestBody Student student) {
        student.setStudentId(studentId);
        return studentService.updateStudent(student);
    }
}
