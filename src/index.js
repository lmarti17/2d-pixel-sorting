const background = require("./assets/mosaert.jpg");
const faceMapping = require("./assets/mosaert-face.jpg");

export default class Scene {
  constructor() {
    this.NUMBER_PIXELS = 640;
    // this.NUMBER_PIXELS = 10;
    // this.NUMBER_PIXELS = 64000;

    this.size = {
      w: window.innerWidth,
      h: window.innerHeight,
    };

    this.history = [];

    this.randomPixelPositions = this.getRandomPixelsPosition(
      this.NUMBER_PIXELS
    );
    this.imageData = [];
    this.mappedPosition = [];
    this.createCanvas();

    this.loadImage(faceMapping, true);
    this.lastScrollPosition = window.scrollY;

    document.addEventListener("scroll", this.handleScroll);
  }

  /**
   * [getRandomPixelsPosition description]
   * @return {[Array]} Array of random {x,y} position in canvas
   */
  getRandomPixelsPosition() {
    let result = [];

    for (var i = 0; i < this.NUMBER_PIXELS; i++) {
      result.push({
        x: Math.floor(Math.random() * this.size.w),
        y: Math.floor(Math.random() * this.size.h),
      });
    }
    return result;
  }

  /**
   * Create canvas
   */
  createCanvas() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.canvas.width = this.size.w;
    this.canvas.height = this.size.h;
  }

  /**
   * Load image and draw into canvas
   */
  loadImage(src, toMap = false) {
    let img = document.createElement("img");
    img.src = src;
    let that = this;

    img.onload = function () {
      let imgCoords = {
        x: Math.abs(img.width - that.size.w) / 2,
        y: Math.abs(img.height - that.size.h) / 2,
      };

      that.ctx.drawImage(
        img,
        0,
        0,
        window.innerWidth,
        (window.innerWidth * img.height) / img.width
      );

      // let data = that.ctx.getImageData(0, 0, canvas.width, canvas.height);

      that.getData(toMap);
    };
  }

  getData(toMap) {
    if (!toMap) {
      for (let i = 0; i < this.mappedPosition.length; i++) {
        let state = {
          data: this.ctx.getImageData(
            this.mappedPosition[i].x,
            this.mappedPosition[i].y,
            1,
            1
          ).data,
          x: this.mappedPosition[i].x,
          y: this.mappedPosition[i].y,
        };

        this.imageData.push(state);
      }
    } else {
      let data = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      ).data;
      console.log(data);

      for (var i = 0; i < data.length - 136; i += 136) {
        if (
          data[i] == 0 &&
          data[i + 1] == 0 &&
          data[i + 2] == 0 &&
          data[i + 3] == 255
        ) {
          this.mappedPosition.push({
            x: Math.floor((i / 4) % this.canvas.width),
            y: Math.floor(i / 4 / this.canvas.width),
          });
        }
      }

      this.loadImage(background);

      console.log(this.mappedPosition);
    }

    // this.drawCanvas();
  }

  getPixelColor(index) {
    let a = parseFloat(this.imageData[index][3] || 1);

    let r = Math.floor(
      a * parseInt(this.imageData[index].data[0]) + (1 - a) * 255
    );
    let g = Math.floor(
      a * parseInt(this.imageData[index].data[1]) + (1 - a) * 255
    );
    let b = Math.floor(
      a * parseInt(this.imageData[index].data[2]) + (1 - a) * 255
    );
    // let r = this.imageData[index][0].toString(16)
    // let g = this.imageData[index][1].toString(16)
    // let b = this.imageData[index][2].toString(16)

    return (
      "#" +
      ("0" + r.toString(16)).slice(-2) +
      ("0" + g.toString(16)).slice(-2) +
      ("0" + b.toString(16)).slice(-2)
    );

    // return `#${r}${g}${b}`;
  }

  /**
   * Clear and draw into canvas
   */
  drawCanvas(delta) {
    this.imageData.map((pixel, index) => {
      this.ctx.beginPath();
      this.ctx.moveTo(pixel.x, pixel.y);
      this.ctx.strokeStyle = this.getPixelColor(index);
      this.ctx.lineTo(pixel.x, pixel.y + delta);
      // set line color

      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    });

    // this.ctx.drawImage(0, 0, position.w, position.h)
  }

  handleScroll = (event) => {
    let delta = window.scrollY - this.lastScrollPosition;
    if (delta >= 0) {
      this.drawCanvas(delta);

      // this.history.push(this.canvas.toDataURL());
      // console.log(this.history);
    } else {
      // if (this.history.length > 0) {
      //   this.ctx.restore();
      // }
    }
  };
}

window.addEventListener("load", () => {
  new Scene();
});
