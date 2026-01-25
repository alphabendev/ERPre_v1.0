package com.project.erpre.controller;

import com.project.erpre.service.OrderReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/orderReport")
public class OrderReportController {

    @Autowired
    private OrderReportService orderReportService;

    // 🔴 Total order amount retrieval method
    // This method receives start date (startDate), end date (endDate),
    // and period type (periodType) from the client,
    // and returns the aggregated order amounts for the specified period.
    @GetMapping("/orders")
    public List<Object[]> getOrders(@RequestParam String startDate,
                                    @RequestParam String endDate,
                                    @RequestParam String periodType) {
        // Formatter to match date format yyyy-MM-dd
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // Convert input strings to LocalDate objects
        LocalDate start = LocalDate.parse(startDate, formatter);
        LocalDate end = LocalDate.parse(endDate, formatter);

        // Convert LocalDate to LocalDateTime and set start and end times
        LocalDateTime startDateTime = start.atStartOfDay(); // Start date at 00:00:00
        LocalDateTime endDateTime = end.atTime(23, 59, 59); // End date at 23:59:59

        // Call the unified service method to return aggregated order amounts by period
        return orderReportService.getOrders(periodType, startDateTime, endDateTime);
    }

    @GetMapping("/ordersByFilter")
    public List<Object[]> getOrdersByFilter(@RequestParam String filterType,
                                            @RequestParam String startDate,
                                            @RequestParam String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        LocalDateTime startDateTime = LocalDate.parse(startDate, formatter).atStartOfDay();
        LocalDateTime endDateTime = LocalDate.parse(endDate, formatter).atTime(23, 59, 59);

        return orderReportService.getOrdersByFilter(filterType, startDateTime, endDateTime);
    }

}
