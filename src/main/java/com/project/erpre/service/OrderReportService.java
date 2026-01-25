package com.project.erpre.service;

import com.project.erpre.repository.OrderReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderReportService {

    @Autowired
    private OrderReportRepository orderReportRepository;

    /**
     * Aggregate order amounts based on period type: monthly, half-yearly, yearly.
     * For half-yearly reports, startMonth and endMonth are used.
     *
     * @param periodType  "monthly", "halfyearly", or "yearly"
     * @param startDate   Start of the period
     * @param endDate     End of the period
     * @return List of Object[] containing aggregated results
     */
    public List<Object[]> getOrders(String periodType, LocalDateTime startDate, LocalDateTime endDate) {

        if ("halfyearly".equals(periodType)) {
            return orderReportRepository.countOrdersByHalfYear(startDate, endDate);
        }

        if ("yearly".equals(periodType)) {
            return orderReportRepository.countOrdersByYear(startDate, endDate);
        }

        // Default: monthly aggregation
        return orderReportRepository.countOrdersByMonth(startDate, endDate);
    }

    /**
     * Retrieve top 10 aggregated results based on filter type.
     * Supported filters: productOrders, customerOrders, employeeOrders
     *
     * @param filterType  Filter criteria
     * @param startDate   Start of the period
     * @param endDate     End of the period
     * @return List of Object[] containing top 10 results
     */
    public List<Object[]> getOrdersByFilter(String filterType, LocalDateTime startDate, LocalDateTime endDate) {
        Pageable top10 = PageRequest.of(0, 10);

        switch (filterType) {
            case "productOrders":
                return orderReportRepository.countOrdersByProduct(startDate, endDate, top10);
            case "customerOrders":
                return orderReportRepository.countOrdersByCustomer(startDate, endDate, top10);
            case "employeeOrders":
                return orderReportRepository.countOrdersByEmployee(startDate, endDate, top10);
            default:
                throw new IllegalArgumentException("Invalid filter type: " + filterType);
        }
    }
}
