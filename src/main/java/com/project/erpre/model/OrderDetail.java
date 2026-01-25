package com.project.erpre.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import javax.persistence.*;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "m_order_d")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class OrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_d_no")
    private Integer orderNo;

    @ManyToOne
    @JoinColumn(name = "order_h_no", nullable = false)
    @JsonIgnore
    private Order order;

    @ManyToOne
    @JoinColumn(name = "product_cd", nullable = false)
    private Product product;

    @Column(name = "order_d_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal orderDPrice;

    @Column(name = "order_d_qty", nullable = false)
    private int orderDQty;

    @Column(name = "order_d_total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal orderDTotalPrice;

    @Column(name = "order_d_delivery_request_date")
    private Timestamp orderDDeliveryRequestDate;

    @Column(name = "order_d_insert_date", nullable = false, insertable = false)
    // insertable = false: JPA ignores this field when inserting the entity,
    // and the database automatically sets the value. Example: automatically insert current time using CURRENT_TIMESTAMP.
    private LocalDateTime orderDInsertDate;

    @Column(name = "order_d_update_date")
    private LocalDateTime orderDUpdateDate;

    @Column(name = "order_d_delete_yn", nullable = false)

    @Builder.Default
    private String orderDDeleteYn = "N"; // Default value 'N' indicates not deleted

    @Column(name = "order_d_delete_date")
    private Timestamp orderDDeleteDate; // Deletion timestamp

}
