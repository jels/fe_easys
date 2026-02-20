import { Directive, EventEmitter, Input, Output } from '@angular/core';

import { LoginDto } from '../../core/models/dto/LoginDto';

export type SortColumnUsr = keyof LoginDto | '';
export type SortDirectionUsr = 'asc' | 'desc' | '';
const rotate: { [key: string]: SortDirectionUsr } = {
    asc: 'desc',
    desc: '',
    '': 'asc'
};

export interface SortEventUsr {
    columnUsr: SortColumnUsr;
    directionUsr: SortDirectionUsr;
}

@Directive({
    selector: 'th[sortableUsr]',
    standalone: true,
    host: {
        '[class.asc]': 'directionUsr === "asc"',
        '[class.desc]': 'directionUsr === "desc"',
        '(click)': 'rotate()'
    }
})
export class NgbdSortableUserList {
    @Input() sortableUsr: SortColumnUsr = '';
    @Input() directionUsr: SortDirectionUsr = '';
    @Output() sortUsr = new EventEmitter<SortEventUsr>();

    rotate() {
        this.directionUsr = rotate[this.directionUsr];
        this.sortUsr.emit({
            columnUsr: this.sortableUsr,
            directionUsr: this.directionUsr
        });
    }
}
