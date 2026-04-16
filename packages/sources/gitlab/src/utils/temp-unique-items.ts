export class TempUniqueItems<T extends { id: number }> {
  _items: T[] = [];
  _ids = new Set<number>();
  add(item: T): void {
    if (!this._ids.has(item.id)) {
      this._ids.add(item.id);
      this._items.push(item);
    }
  }
  write(batch: T[]): void {
    for (const item of batch) {
      this.add(item);
    }
  }
  read(): T[] {
    const items = this._items;
    this._ids = undefined as any;
    this._items = undefined as any;
    return items;
  }
  size(): number {
    return this._items.length;
  }
}
