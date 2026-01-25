package com.project.erpre.model;


import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "m_order_h")
@Setter
@Getter
//@ToString()
@NoArgsConstructor
@AllArgsConstructor
@Builder // Adds the builder pattern
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_h_no")
    private Integer orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_no")
    private Customer customer;

    @Column(name = "order_h_total_price")
    private BigDecimal orderHTotalPrice;

    @Column(name = "order_h_status")
    private String orderHStatus;

    @Column(name = "order_h_insert_date", nullable = false, insertable = false)
    // insertable = false: JPA ignores this field when inserting the entity,
    // and the database automatically sets the value. Example: automatically insert current time using CURRENT_TIMESTAMP.
    private LocalDateTime orderHInsertDate;

    @Column(name = "order_h_update_date")
    private LocalDateTime orderHUpdateDate;

    @Column(name = "order_h_delete_yn", length = 1, nullable = false, columnDefinition = "VARCHAR(1) DEFAULT 'N'")
    private String orderHDeleteYn; // Default value 'N'

    @Column(name = "order_h_delete_date")
    private Timestamp orderHDeleteDate; // Deletion timestamp

    @OneToMany(mappedBy = "order", cascade = {CascadeType.PERSIST, CascadeType.MERGE}, orphanRemoval = true)
    private List<OrderDetail> orderDetails;
    // Relationship between order and products

    @Transient
    public List<String> getProductNames() {
        if (orderDetails == null) {
            return new ArrayList<>();
        }
        return orderDetails.stream()
                .filter(od -> od.getProduct() != null) // Check if getProduct() is null
                .map(od -> od.getProduct().getProductNm())
                .collect(Collectors.toList());
    }

    public void recalculateTotalPrice() {
        this.orderHTotalPrice = orderDetails.stream()
                .map(OrderDetail::getOrderDTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
