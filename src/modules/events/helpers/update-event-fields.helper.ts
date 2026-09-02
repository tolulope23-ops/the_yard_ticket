import { Event } from '../entities/events.entity';
import { UpdateEventDto } from '../dto/update-event.dto';

export function updateEventFields(event: Event, dto: UpdateEventDto): Event {
    if (dto.title !== undefined) {
        event.title = dto.title;
    };

    if (dto.description !== undefined) {
        event.description = dto.description;
    };

    if (dto.eventCategory !== undefined) {
        event.eventCategory = dto.eventCategory;
    };

    if (dto.eventBannerImage !== undefined) {
        event.eventBannerImage = dto.eventBannerImage;
    };

    if (dto.eventVenue !== undefined) {
        event.eventVenue = dto.eventVenue;
    };

    if (dto.address !== undefined) {
        event.eventAddress = dto.address;
    };

    if (dto.eventDate !== undefined) {
        event.eventDate = dto.eventDate;
    };

    if (dto.eventStartTime !== undefined) {
        event.eventStartTime = dto.eventStartTime;
    };

    if (dto.eventEndTime !== undefined) {
        event.eventEndTime = dto.eventEndTime;
    };

    return event;
};