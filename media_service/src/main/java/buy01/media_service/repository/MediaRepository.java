package buy01.media_service.repository;

import buy01.media_service.model.Media;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface MediaRepository extends MongoRepository<Media, Long> {

    Optional<Media> findByFileName(String fileName);

}