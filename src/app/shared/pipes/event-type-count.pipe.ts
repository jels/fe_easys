// src/app/shared/pipes/event-type-count.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { EventMock } from '../data/operations.mock';

@Pipe({ name: 'eventTypeCount', standalone: true, pure: false })
export class EventTypeCountPipe implements PipeTransform {
    transform(events: EventMock[], idEventType: number): number {
        return events.filter((e) => e.idEventType === idEventType && e.isActive).length;
    }
}
