package com.project.erpre.model;


import lombok.*;


import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderDetailDTO {

    private Integer orderNo;  // Primary key of OrderDetail
    private Integer orderHNo; // Foreign key of Order (used instead of Order entity)
    private String productCd; // Foreign key of Product (used instead of Product entity)
    private BigDecimal orderDPrice;
    private int orderDQty;
    private BigDecimal orderDTotalPrice;
    private Timestamp orderDDeliveryRequestDate;

    private LocalDateTime orderDInsertDate;
    private LocalDateTime orderDUpdateDate;
    @Builder.Default
    private String orderDDeleteYn = "N"; // Default value
    private Timestamp orderDDeleteDate; // Deletion timestamp

    // Entity: Mapped 1:1 to a database table, uses JPA annotations to define relationships (@ManyToOne, @OneToMany, etc.)
    //         and manages data retrieved from the database.
    // DTO: Data Transfer Object used to efficiently transfer data between the service layer and controller,
    //      including only simple fields like IDs instead of full entity objects to improve transmission efficiency.
}
