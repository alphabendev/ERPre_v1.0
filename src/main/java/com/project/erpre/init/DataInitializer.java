package com.project.erpre.init;

import com.project.erpre.model.Employee;
import com.project.erpre.repository.EmployeeRepository;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Configuration
@ConfigurationProperties(prefix = "admin")
@Slf4j
@Data
public class DataInitializer {

    private String id;
    private String password;
    private String email;
    private String name;
    private String tel;

    @Bean
    CommandLineRunner initDatabase(EmployeeRepository employeeRepository) {
        return args -> {

            if (!employeeRepository.existsById(id)) {

                Employee defaultAdmin = Employee.builder()
                        .employeeId(id)
                        .employeePw(password)   // hash later
                        .employeeName(name)
                        .employeeEmail(email)
                        .employeeTel(tel)
                        .employeeRole("ADMIN")
                        .employeeInsertDate(Timestamp.valueOf(LocalDateTime.now()))
                        .employeeDeleteYn("N")
                        .build();

                employeeRepository.save(defaultAdmin);
                log.info("Default admin user initialized: {}", id);
            }
        };
    }
}
