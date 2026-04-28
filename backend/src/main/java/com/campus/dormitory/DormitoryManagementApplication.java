package com.campus.dormitory;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class DormitoryManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(DormitoryManagementApplication.class, args);
    }
}
