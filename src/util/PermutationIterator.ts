export class PermutationIterator<Type> {
  private list: Type[];
  private temp1: Type[];
  private temp2: Type[];
  private stack: number[];
  private index: number;
  private size: number;

  constructor(list: Type[]) {
    this.list = list;
    this.size = list.length;
    this.temp1 = [];
    this.temp2 = [];
    this.stack = [];
    for (let i = 0; i < this.size; i++) {
      this.stack.push(0);
      this.temp1.push(this.list[i]);
      this.temp2.push(this.list[i]);
    }
    this.index = 0;
  }

  [Symbol.iterator]() {
    return {
      next: () => {
        if (this.temp1.length > 0) {
          const value = this.getNext();
          return { value: value, done: false };
        }
        return { done: true }
      }
    }
  }

  getNext(): Type[] {
    this.update();
    return this.temp2;
  }

  update() {
    let done = true;

    while (this.index < this.size) {
      if (this.stack[this.index] < this.index) {
        if (this.index % 2 === 0) {
          this.swap(0, this.index);
        } else {
          this.swap(this.stack[this.index], this.index);
        }

        this.stack[this.index]++;
        this.index = 0;
        done = false;
        break;
      } else {
        this.stack[this.index] = 0;
        this.index++;
      }
    }

    if (done) {
      this.temp2 = this.temp1;
      this.temp1 = [];
    }
  }

  swap(i: number, j: number) {
    const temp = this.temp2[i];
    this.temp2[i] = this.temp2[j];
    this.temp2[j] = temp;
  }
}