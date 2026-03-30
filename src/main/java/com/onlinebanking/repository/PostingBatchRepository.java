package com.onlinebanking.repository;

import com.onlinebanking.model.PostingBatch;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostingBatchRepository extends JpaRepository<PostingBatch, Long> {
}
