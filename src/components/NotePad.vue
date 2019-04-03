<template>
  <div class="note-pad__anchor" :style="cssCustomProperties" ref="anchor">
    <Icon class="note-pad__icon" @click="open" />
    <div
      class="note-pad__blur-detector"
      @click="isFocus = false"
      v-show="isOpened"
    ></div>
    <div
      class="note-pad"
      :class="{
        'note-pad--is-changing-page': isChangingPage,
        'note-pad--is-dragging': isDragging,
        'note-pad--is-focus': isFocus
      }"
      @click="isFocus = true"
      v-show="isOpened"
    >
      <div class="note-pad__header" v-stream:mousedown="dragStart$">
        <div
          class="note-pad__button"
          :class="{ 'note-pad__button--is-button-down': isButtonDown }"
          v-show="isFocus"
          v-stream:mousedown.stop="mousedown$"
          @click="close"
        >
          +
        </div>
      </div>
      <textarea
        class="note-pad__content"
        v-model="content"
        v-stream:keyup="change$"
        v-stream:change="change$"
        spellcheck="false"
      ></textarea>
      <div class="note-pad__page">{{ pageNumber + 1 }}</div>
      <div class="note-pad__triangle" @click="changePage($event)"></div>
    </div>
    <div
      class="note-pad__draggable"
      :class="{
        'note-pad__draggable--is-opening': isOpening,
        'note-pad__draggable--is-dragging': isDragging
      }"
    ></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { fromEvent, Observable, Subject } from "rxjs";
import {
  concatAll,
  filter,
  map,
  takeUntil,
  tap,
  throttleTime,
  withLatestFrom
} from "rxjs/operators";
import Icon from "./Icon.vue";

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

@Component<NotePad>({
  components: {
    Icon
  },
  subscriptions() {
    const mouseDown = this.dragStart$.pipe(
      tap(() => {
        const anchor = this.$refs.anchor as HTMLDivElement;
        this.anchor = anchor.getBoundingClientRect() as DOMRect;
        this.isDragging = true;
      }),
      map(({ event }) => event)
    );
    const mouseUpAfterDrag = this.mouseUp$.pipe(
      tap(() => {
        this.isDragging = false;
        this.cssCustomProperties[
          "--static-transform"
        ] = this.cssCustomProperties["--transform"];
      })
    );

    return {
      transform: mouseDown.pipe(
        map(() => this.mouseMove$.pipe(takeUntil(mouseUpAfterDrag))),
        concatAll(),
        withLatestFrom(mouseDown, (move, down) => {
          const { x: anchorX = 0, y: anchorY = 0 } = this.anchor || {};
          const calculated = {
            x: move.clientX - anchorX - down.offsetX,
            y: move.clientY - anchorY - down.offsetY
          };
          const translate = calculated;
          const transform = `translate(${translate.x}px, ${translate.y}px)`;
          this.cssCustomProperties["--transform"] = transform;
          return transform;
        })
      )
    };
  }
})
export default class NotePad extends Vue {
  private anchor?: DOMRect;
  private change$ = new Subject();
  private content = "";
  private cssCustomProperties = {
    "--direction": "normal",
    "--transform": "translate(0px, 0px)",
    "--static-transform": "translate(0px, 0px)"
  };
  private dragStart$ = new Subject<{ event: MouseEvent }>();
  private isButtonDown = false;
  private isChangingPage = false;
  private isOpening = false;
  private isOpened = false;
  private isDragging = false;
  private isFocus = true;
  private lastSavedContent = "";
  private mousedown$ = new Subject();
  private mouseMove$ = fromEvent<MouseEvent>(document, "mousemove");
  private mouseUp$ = fromEvent<MouseEvent>(document, "mouseup");
  private pageNumber = 0;
  private transform = "";

  public mounted() {
    this.content = this.getContent(this.pageNumber);
    this.lastSavedContent = this.content;
    this.subscribeObservable();
    this.cssCustomProperties[
      "--static-transform"
    ] = `translate(${(window.innerWidth - 220) / 2}px, ${(window.innerHeight -
      245) /
      2}px)`;
  }
  private subscribeObservable() {
    this.$subscribeTo(
      this.change$.pipe(
        filter(() => this.lastSavedContent !== this.content),
        throttleTime(500, undefined, { leading: true, trailing: true })
      ),
      this.saveContent
    );

    const mouseUpAfterClick$ = this.mouseUp$.pipe(
      tap(() => {
        this.isButtonDown = false;
      })
    );
    this.$subscribeTo(
      this.mousedown$.pipe(
        tap(() => {
          this.isButtonDown = true;
        }),
        map(() => this.mouseMove$.pipe(takeUntil(mouseUpAfterClick$))),
        concatAll()
      ),
      () => {}
    );
  }
  private async open() {
    this.isOpening = true;
    this.cssCustomProperties["--transform"] = this.cssCustomProperties[
      "--static-transform"
    ];
    await sleep(700);
    this.isOpened = true;
  }
  private close() {
    this.isOpened = false;
    this.isOpening = false;
    this.cssCustomProperties["--transform"] = "translate(0px, 0px)";
  }
  private async changePage({ offsetX, offsetY }: MouseEvent) {
    this.content = "";
    this.isChangingPage = true;
    if (offsetY < offsetX) {
      this.toNextPage();
    } else {
      this.toPreviousPage();
    }

    await sleep(300);
    this.isChangingPage = false;
    this.content = this.getContent(this.pageNumber);
  }
  private toNextPage() {
    this.cssCustomProperties["--direction"] = "normal";
    this.pageNumber = (this.pageNumber + 1) & 7;
  }
  private toPreviousPage() {
    this.cssCustomProperties["--direction"] = "reverse";
    this.pageNumber = (this.pageNumber - 1) & 7;
  }
  private saveContent() {
    this.lastSavedContent = this.content;
    this.setContent(this.pageNumber, this.content);
  }
  private getContent(page: number) {
    return localStorage.getItem(`${page}`) || "";
  }
  private setContent(page: number, content: string) {
    localStorage.setItem(`${page}`, content);
  }
}
</script>

<style scoped lang="scss">
@keyframes note-pad {
  100% {
    width: 0;
  }
}
@keyframes triangle {
  100% {
    width: 218px;
    height: 218px;
  }
}
@keyframes triangle-before {
  100% {
    border-width: 0 218px 218px 0;
  }
}
@keyframes triangle-after {
  100% {
    border-width: 0 215px 215px 0;
  }
}

.note-pad {
  position: absolute;
  top: 0;
  left: 0;
  flex-flow: column;

  display: flex;
  transform: var(--static-transform);

  box-shadow: 1px 1px 0 1px #000;
  border: 1px solid #000;
  width: 220px;
  height: 245px;

  background: #fff;

  font-size: 14px;

  &::after {
    content: "";

    position: absolute;
    bottom: 3px;
    left: 0;

    box-shadow: 0 2px #000;
    border-top: 1px solid #000;
    width: 100%;
  }

  &__icon {
    cursor: pointer;
  }

  &__blur-detector {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
  }

  &__header {
    position: relative;
    align-items: center;

    display: flex;

    border-bottom: 1px solid #000;
    width: 100%;
    height: 20px;

    &::after {
      content: "Note Pad";

      position: absolute;
      top: 0;
      bottom: 0;
      left: 50%;
      justify-content: center;
      align-items: center;

      display: flex;
      transform: translateX(-50%);

      padding: 0 5px;

      background: #fff;

      font-weight: bold;
    }
  }

  &--is-focus {
    .note-pad__header::before {
      content: "";

      position: absolute;
      top: 4px;
      left: 2px;
      right: 2px;

      box-shadow: 0 2px #000, 0 4px #000, 0 6px #000, 0 8px #000, 0 10px #000;
      border-top: 1px solid #000;
      height: 0;
    }
  }

  &__button {
    position: relative;
    z-index: 1;
    justify-content: center;
    align-items: center;

    display: flex;

    margin-left: 10px;
    box-shadow: 0 0 0 1px #fff;
    border: 1px solid #000;
    width: 11px;
    height: 11px;
    padding: 0;
    padding-bottom: 2px;

    background: #fff;
    cursor: pointer;

    font-size: 17px;
    font-family: "Lucida Grande", "Lucida Sans Unicode", sans-serif;
    color: transparent;

    user-select: none;

    &--is-button-down:hover {
      color: #000;

      &::before {
        content: "×";

        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        justify-content: center;
        align-items: center;

        display: flex;

        padding-bottom: 2px;

        font-size: 11px;
      }

      &::after {
        content: "";

        position: absolute;
        top: 2px;
        bottom: 2px;
        left: 2px;
        right: 2px;

        background: radial-gradient(circle, #fff, #fff 40%, transparent);
      }
    }
  }

  &__content {
    flex: 1;

    overflow: hidden;

    border: 0;
    padding: 10px;
    padding-bottom: 35px;

    outline: 0;

    line-height: 1.3em;
    word-break: break-all;

    resize: none;

    &::selection {
      background: #000;

      color: #fff;
    }
  }

  &__triangle {
    position: absolute;
    bottom: 5px;
    left: -1px;

    width: 30px;
    height: 30px;

    cursor: pointer;

    &::before {
      content: "";

      position: absolute;
      left: 0;
      bottom: 0;

      border: 0 solid transparent;
      border-bottom: 30px solid transparent;
      border-right: 30px solid #000;
      width: 0;
      height: 0;
    }

    &::after {
      content: "";

      position: absolute;
      top: 1px;
      right: 1px;

      border: 0 solid transparent;
      border-right: 27px solid #fff;
      border-bottom: 27px solid transparent;
      width: 0;
      height: 0;
    }
  }

  &__page {
    position: absolute;
    bottom: 5px;
    justify-content: center;
    align-items: center;

    display: flex;

    width: 100%;
    height: 30px;

    user-select: none;

    &::after {
      content: "";

      position: absolute;
      bottom: 0;
      right: 0;

      border-top: 1px solid #000;
      width: 190px;
    }
  }

  &--is-changing-page {
    $change-page-duration: 0.25s;

    .note-pad__page::after {
      animation-name: note-pad;
      animation-duration: $change-page-duration;
      animation-direction: var(--direction);
    }

    .note-pad__triangle {
      animation-name: triangle;
      animation-duration: $change-page-duration;
      animation-direction: var(--direction);

      &::before {
        animation-name: triangle-before;
        animation-duration: $change-page-duration;
        animation-direction: var(--direction);
      }

      &::after {
        animation-name: triangle-after;
        animation-duration: $change-page-duration;
        animation-direction: var(--direction);
      }
    }
  }

  &--is-dragging {
    user-select: none;
  }
}

.note-pad__anchor {
  position: absolute;
}

.note-pad__draggable {
  $draggable-duration: 0.7s;

  position: absolute;
  top: 0;
  left: 0;

  opacity: 0;
  transform: var(--transform);
  transform-origin: top left;

  transition: transform $draggable-duration, height $draggable-duration,
    width $draggable-duration, opacity 0s linear $draggable-duration;

  border: 1px dotted #000;
  width: 0;
  height: 0;

  &--is-opening {
    opacity: 1;

    transition: transform $draggable-duration, height $draggable-duration,
      width $draggable-duration, border-color 0s linear $draggable-duration;

    border-color: transparent;
    width: 220px;
    height: 245px;

    pointer-events: none;
  }

  &--is-dragging {
    transition: initial;

    border-color: #000;
  }
}
</style>
