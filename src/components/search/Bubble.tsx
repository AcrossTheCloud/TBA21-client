import * as React from 'react';
import $ from 'jquery';

import 'styles/components/search/bubble.scss';

interface Props {
  callback?: Function;
}

interface Point {
  x: number;
  y: number;
  color?: string;
}

class Point {
  constructor(x: number, y: number, color?: string) {
    this.x = x;
    this.y = y;
    this.color = color;
  }

  toString() { return `${ this.x }, ${ this.y }`; }
}

// class Color {
//   static random() {
//     // tslint:disable-next-line:no-bitwise
//     return '#' + ((Math.random() * 0xFFFFFF) << 0).toString(16);
//   }
// }

class Easing {
  static easeOutCubic(t: number) {
    return 4 * t * t * t;
  }

  static easeInOutCubic(t: number) {
    if (t < .5) {
      return 4 * t * t * t;
    } else { return ((t - 1) * ((2 * t) - 2) * ((2 * t) - 2)) + 1; }
  }
}

export class Bubble extends React.Component<Props, {}> {
  resizeTimeout;
  bounds;
  pointRadius;
  canvas;
  ctx: CanvasRenderingContext2D | null;
  origin;
  points: Point[];
  touchX;
  touchY;

  _isMounted;

  constructor(props: Props) {
    super(props);
    this._isMounted = false;

    this.points = [];
    this.ctx = null;

    const $body = $('body');

    // On Move
    $body.on('mousemove touchmove', '#bubble', e => {
      if (e) {
        const pageX: number = !!e.touches ? e.touches[0].pageX : (!!e.pageX ? e.pageX : 0);
        const pageY: number = !!e.touches ? e.touches[0].pageY : (!!e.pageY ? e.pageY : 0);
        this.touchX = pageX;
        this.touchY = pageY;
        this.moveBubble(pageX, pageY);

      } else {
        return;
      }
    });

    // On Click
    $body.on('click', '#bubble', e => {
      if (e && this._isMounted) {
        const eX: number = !!e.pageX ? e.pageX : 0;
        const eY: number = !!e.pageY ? e.pageY : 0;


        if (typeof this.props.callback === 'function') {
          if (this.state.canMove) {
            this.props.callback(this.getFocus(eX, eY));
          } else {
            this.props.callback({
              focus_art: false,
              focus_action: false,
              focus_scitech: false
            });
          }
        }

        this.setState({ canMove: !this.state.canMove }, () => this.moveBubble(eX, eY) );

        this.moveBubble(eX, eY);
      } else {
        return;
      }
    });

    // On Click or On touch
    $body.on('touchend', '#bubble', e => {
      if (this._isMounted) {
        this.getFocus(this.touchX, this.touchY);
      }
    });

  }

  componentDidMount(): void {
    this._isMounted = true;

    this.init();

    window.addEventListener('resize', () => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        $('#bubble').remove();
        $('#bubbleWrapper').append('<canvas id="bubble" />').ready(() => this.init());
      }, 500);
    });
  }

  componentWillUnmount(): void {
    this._isMounted = false;
    window.removeEventListener('resize', () => { return; });
  }

  moveBubble = (eX: number, eY: number) => {
    const
      offset: { top: number; left: number; } = $('#bubble').offset() as JQueryCoordinates,
      x = eX - offset.left,
      y = eY - offset.top;

    return this.moveOrigin(this.origin, new Point(x, y), new Date().getTime(), 300);
  }

  toggleLabelHighlight = (labelClass: string, toggle: boolean) => {
    const $label = $('#bubbleWrapper .' + labelClass);

    if (toggle) {
      $label.addClass('active');
    } else {
      $label.removeClass('active');
    }
  }

  getFocus = (eX: number, eY: number) => {
    const
      offset: { top: number; left: number; } = $('#bubble').offset() as JQueryCoordinates,
      x = eX - offset.left,
      y = eY - offset.top;

    const [w1, w2, w3] = this.calc_barycentric_weights(x, y);

    let
      focusArts: boolean,
      focusAction: boolean,
      focusScitech: boolean;

    focusArts = Math.fround(w2) >= 0.3;
    focusAction = Math.fround(w3) >= 0.23;
    focusScitech = Math.fround(w1) >= 0.23;

    this.toggleLabelHighlight('art', focusArts);
    this.toggleLabelHighlight('action', focusAction);
    this.toggleLabelHighlight('scitech', focusScitech);

    console.log(
      'focusArts', focusArts, Math.fround(w2),
      'focusAction', focusAction, Math.fround(w3),
      'focusScitech', focusScitech, Math.fround(w1),
    );

    return {
      focus_arts: focusArts,
      focus_action: focusAction,
      focus_scitech: focusScitech,
    };
  }

  sqr = num => num * num;

  init = () => {
    let asc, end, i, step;
    let x, y;

    const canvas: HTMLCanvasElement = document.getElementById('bubble') as HTMLCanvasElement;
    this.canvas = canvas;
    this.resize();

    this.pointRadius = Math.min(canvas.width, canvas.height) / 15;

    this.ctx = canvas.getContext('2d');
    this.bounds = new Point(canvas.width, canvas.height);

    this.origin = new Point(this.bounds.x / 2, this.bounds.y / 2);

    this.points = [];
    for (i = 0, y = i, end = canvas.height, step = this.pointRadius * 2, asc = step > 0; asc ? i <= end : i >= end; i += step, y = i) {
      let
        asc1: boolean = false,
        end1: number = 0,
        j: number = 0,
        step1: number = 0;

      for (j = 0, x = j, end1 = canvas.width, step1 = this.pointRadius * 2, asc1 = step1 > 0; asc1 ? j <= end1 : j >= end1; j += step1, x = j) {
        this.points.push(new Point(x + (((y / (this.pointRadius * 2)) % 2) * this.pointRadius), y, this.bubbleColour(x, y)));
      }
    }

    // Set to the middle
    this.moveOrigin(this.origin, new Point(this.bounds.x / 2, this.bounds.y / 2), new Date().getTime(), 300);
  }

  resize = () => {
    const wrapper = document.getElementById('bubbleWrapper') as HTMLElement;
    this.canvas.width = wrapper.getBoundingClientRect().width;
    this.canvas.height = wrapper.getBoundingClientRect().height;
  }

  int_color(c1: number, c2: number, c3: number, w1: number, w2: number, w3: number): string {
    // tslint:disable-next-line:no-bitwise
    let r: number = ((c1 >> 16) & 0xFF) * w1 + ((c2 >> 16) & 0xFF) * w2 + ((c3 >> 16) & 0xFF) * w3;
    // tslint:disable-next-line:no-bitwise
    let g: number = ((c1 >> 8) & 0xFF) * w1 + ((c2 >> 8) & 0xFF) * w2 + ((c3 >> 8) & 0xFF) * w3;
    // tslint:disable-next-line:no-bitwise
    let b: number = (c1 & 0xFF) * w1 + (c2 & 0xFF) * w2 + (c3 & 0xFF) * w3;

    r = r > 255 ? 255 : r;
    g = g > 255 ? 255 : g;
    b = b > 255 ? 255 : b;

    // tslint:disable-next-line:no-bitwise
    const c = Math.floor((b + (g << 8) + (r << 16)));
    return '#' + ('000000' + (c.toString(16))).slice(-6).toUpperCase();
  }

  // https://codeplea.com/triangular-interpolation
  calc_barycentric_weights(x: number, y: number): number[] {
    // triangle vertices
    const v1x = 0, v1y = this.canvas.height;
    const v2x = Math.floor(this.canvas.width / 2), v2y = 0;
    const v3x = this.canvas.width;
    const v3y = this.canvas.height;

    const wV1 = (x * (v3y - v2y) + v2x * (y - v3y) + v3x * (v2y - y)) / (v1x * (v3y - v2y) + v2x * (v1y - v3y) + v3x * (v2y - v1y));
    const wV2 =  - (x * (v3y - v1y) + v1x * (y - v3y) + v3x * (v1y - y)) / (v1x * (v3y - v2y) + v2x * (v1y - v3y) + v3x * (v2y - v1y));
    const wV3 = 1.0 - wV1 - wV2;

    return [wV1, wV2, wV3];
  }

  bubbleColour(x: number, y: number): string {
    let c1 = 0x9039FE; // purple
    let c2 = 0x0076FF; // blue
    let c3 = 0x50E2C1; // mint

    let [w1, w2, w3] = this.calc_barycentric_weights(x, y);

    w1 = w1 < 0 ? 0 : w1;
    w2 = w2 < 0 ? 0 : w2;
    w3 = w3 < 0 ? 0 : w3;
    w1 /= (w1 + w2 + w3);
    w2 /= (w1 + w2 + w3);
    w3 /= (w1 + w2 + w3);

    return this.int_color(c1, c2, c3, w1, w2, w3);
  }

  scaledRadius(x: number, y: number, radius: number) {
    const denom = Math.min(this.bounds.x, this.bounds.y);
    return radius * ((-1.5 * (this.sqr((1.5 * (x - this.origin.x)) / denom) + this.sqr((1.5 * (y - this.origin.y)) / denom))) + 0.7);
  }

  moveOrigin(startPoint: Point, endPoint: Point, startTime: number, duration: number) {
    let t = new Date().getTime() - startTime;
    if (t >= duration) { return; }
    t /= duration;
    t = Easing.easeInOutCubic(t);
    this.origin.x = startPoint.x + (t * (endPoint.x - startPoint.x ));
    this.origin.y = startPoint.y + (t * (endPoint.y - startPoint.y ));
    return requestAnimationFrame(() => {
      this.moveOrigin(startPoint, endPoint, startTime, duration);
      return this.draw();
    });
  }

  draw() {
    if (!this.ctx) { return; }

    this.ctx.clearRect(0, 0, this.bounds.x, this.bounds.y);
    const result: void[] = [];
    for (let point of Array.from(this.points)) {
      this.ctx.fillStyle = point.color ? point.color : '#fff';
      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
      let r = this.scaledRadius(point.x, point.y, this.pointRadius);
      if (r < 0) { r = 0; }
      this.ctx.arc(point.x, point.y, r, 0, 2 * Math.PI);

      result.push(this.ctx.fill());
    }
    return result;
  }

  render() {
    return (
      <div id="bubbleWrapper">
        <div className="art active">
          <div className="focus">Art</div>
        </div>
        <div className="action active">
          <div className="focus">Action</div></div>
        <div className="scitech active">
          <div className="focus">Scitech</div></div>
        <canvas id="bubble" />
      </div>
    );
  }

}
