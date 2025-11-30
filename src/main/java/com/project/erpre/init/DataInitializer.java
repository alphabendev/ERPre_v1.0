
package com.project.erpre.init;

import com.project.erpre.model.Employee;
import com.project.erpre.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(@Autowired EmployeeRepository employeeRepository) {
        return args -> {
            // Check if default admin exists
            if (!employeeRepository.existsById("admin")) {
                Employee defaultAdmin = Employee.builder()
                        .employeeId("admin")
                        .employeePw("admin123")  // In production, use proper password hashing
                        .employeeName("System Administrator")
                        .employeeEmail("admin@example.com")
                        .employeeTel("000-0000-0000")
                        .employeeRole("ADMIN")
                        .employeeInsertDate(Timestamp.valueOf(LocalDateTime.now()))
                        .employeeDeleteYn("N")
                        .build();

                employeeRepository.save(defaultAdmin);
                System.out.println("Default admin user has been initialized");
            }
        };
    }
}