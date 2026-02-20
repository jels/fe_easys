// src/app/shared/pipes/type-count.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'typeCount', standalone: true, pure: false })
export class TypeCountPipe implements PipeTransform {
    transform(byType: { idNotificationType: number; count: number }[] | null, idType: number): number {
        if (!byType) return 0;
        return byType.find((t) => t.idNotificationType === idType)?.count ?? 0;
    }
}
