const background = require("./assets/jim-basio-ozQ6Ve3ar1w-unsplash.jpg");
const faceMapping = require("./assets/mask.png");

export default class Scene {
  constructor() {
    this.NUMBER_PIXELS = 640;
    // this.NUMBER_PIXELS = 10;
    // this.NUMBER_PIXELS = 64000;

    this.size = {
      w: window.innerWidth,
      h: window.innerHeight,
    };
    this.img;

    this.history = [];

    // this.randomPixelPositions = this.getRandomPixelsPosition(
    //   this.NUMBER_PIXELS
    // );
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
  // getRandomPixelsPosition() {
  //   let result = [];

  //   for (var i = 0; i < this.NUMBER_PIXELS; i++) {
  //     result.push({
  //       x: Math.floor(Math.random() * this.size.w),
  //       y: Math.floor(Math.random() * this.size.h),
  //     });
  //   }
  //   return result;
  // }

  /**
   * Create canvas
   */
  createCanvas() {
    this.canvas = document.getElementById("canvas");
    this.ctx = canvas.getContext("2d");
    this.canvas.width = this.size.w * window.devicePixelRatio;
    this.canvas.height = this.size.h * window.devicePixelRatio;
  }

  /**
   * Load image and draw into canvas
   */
  loadImage(src, toMap = false) {
    let img = document.createElement("img");
    img.src = src;
    let that = this;

    if (!toMap) {
      that.img = img;
    }

    img.onload = function () {
      that.imgCoords = {
        x:
          Math.abs(
            that.canvas.width -
              ((window.innerHeight * img.width) / img.height) *
                window.devicePixelRatio
          ) / 2,
        y: Math.abs(that.canvas.height - img.height) / 2,
      };

      that.drawImage(img);

      that.getData(toMap);
    };
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawImage(img) {
    this.ctx.drawImage(
      img,
      this.imgCoords.x,
      0,
      ((window.innerHeight * img.width) / img.height) * window.devicePixelRatio,
      // window.innerWidth * window.devicePixelRatio,
      window.innerHeight * window.devicePixelRatio
      // ((window.innerWidth * img.height) / img.width) * window.devicePixelRatio
    );
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

      for (var i = 0; i < data.length - 272; i += 272) {
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
    }
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
  }

  handleScroll = (event) => {
    let delta = window.scrollY - this.lastScrollPosition;

    this.drawCanvas(delta);
  };
}

window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

window.addEventListener("load", () => {
  let scene = new Scene();
  document.getElementById("refresh").addEventListener("click", () => {
    window.scrollTo(0, 0);
    scene.clearCanvas();
    scene.drawImage(scene.img);
  });

  window.onresize = function () {
    window.scrollTo(0, 0);
    scene.clearCanvas();
    scene.drawImage(scene.img);
  };
});
