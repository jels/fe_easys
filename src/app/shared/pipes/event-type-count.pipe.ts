// src/app/shared/pipes/event-type-count.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Cuenta cuántos eventos de un tipo determinado hay en la lista.
 * Acepta cualquier array que tenga idEventType (EventMock, EventResponse, etc.)
 */
@Pipe({
    name: 'eventTypeCount',
    standalone: true
})
export class EventTypeCountPipe implements PipeTransform {
    transform(events: { idEventType: number }[] | null | undefined, idEventType: number): number {
        if (!events) return 0;
        return events.filter((e) => e.idEventType === idEventType).length;
    }
}
