export class FakeClock {
    private time: number = 0;

    now() {
        this.time += 1;
        return this.time;
    }
}
