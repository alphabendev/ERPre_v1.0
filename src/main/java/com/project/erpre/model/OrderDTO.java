package com.project.erpre.model;

import lombok.*;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDTO {

    private Integer orderNo;
    private Employee employee;
    private Customer customer;
    private BigDecimal orderHTotalPrice;
    private String orderHStatus;
    private LocalDateTime orderHInsertDate;
    private LocalDateTime orderHUpdateDate;
    private String orderHDeleteYn; // Default value 'N' indicates deletion status
    private Timestamp orderHDeleteDate; // Deletion timestamp

    // Additional fields
    @Builder.Default
    private List<OrderDetailDTO> orderDetails = new ArrayList<>();
    private List<Integer> deletedDetailIds; // Array of IDs for details to be deleted
    private List<Product> products; // List of products
}
