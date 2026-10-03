import { Directive, EventEmitter, HostBinding, HostListener, Input, NgZone, OnDestroy, Output } from '@angular/core';

/**
 * Emite `longPress` tras mantener presionado el elemento host `duration` ms.
 * Se cancela si el puntero se suelta antes, o si se mueve más de `moveThreshold`px
 * (para no competir con el swipe de ion-item-sliding).
 */
@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective implements OnDestroy {
  @Input() longPressDuration = 550;
  @Output() longPress = new EventEmitter<void>();

  @HostBinding('class.is-pressing') isPressing = false;

  private readonly moveThreshold = 12;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private startX = 0;
  private startY = 0;

  constructor(private zone: NgZone) {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.isPressing = true;

    this.zone.runOutsideAngular(() => {
      this.timer = setTimeout(() => {
        this.zone.run(() => {
          this.isPressing = false;
          this.longPress.emit();
        });
      }, this.longPressDuration);
    });
  }

  @HostListener('pointerup')
  @HostListener('pointerleave')
  @HostListener('pointercancel')
  onPointerEnd() {
    this.clearTimer();
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent) {
    const dx = Math.abs(event.clientX - this.startX);
    const dy = Math.abs(event.clientY - this.startY);
    if (dx > this.moveThreshold || dy > this.moveThreshold) {
      this.clearTimer();
    }
  }

  private clearTimer() {
    this.isPressing = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  ngOnDestroy() {
    this.clearTimer();
  }
}
