export class PermutationIterator<T> implements Iterator<T[]> {
  private list: T[];
  private temp1: T[];
  private temp2: T[];
  private stack: number[];
  private index: number;
  private size: number;

  constructor(list: T[]) {
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

  public next(): IteratorResult<T[]> {
    if (this.temp1.length > 0) {
      const value = this.getNext();
      return { value: value, done: false }
    }
    return { value: [], done: true }
  }

  private getNext(): T[] {
    this.update();
    return this.temp2;
  }

  private update() {
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

  private swap(i: number, j: number) {
    const temp = this.temp2[i];
    this.temp2[i] = this.temp2[j];
    this.temp2[j] = temp;
  }
}