import { EventEmitter } from 'events';

export class DUIPageController extends EventEmitter {
    constructor() {
        super();
    }

    rebuild(): void {
        this.emit('change');
    }
}