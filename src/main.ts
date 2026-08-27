import { Plugin, type WorkspaceLeaf } from 'obsidian';
import { ARCADE_VIEW_TYPE, ArcadeView } from './arcade-view';
import { DEFAULT_ARCADE_DATA, parseArcadeData, type ArcadeDataV1 } from './data';

export default class ArcadePlugin extends Plugin {
  private data: ArcadeDataV1 = DEFAULT_ARCADE_DATA;
  private saveQueue: Promise<void> = Promise.resolve();

  public async onload(): Promise<void> {
    this.data = parseArcadeData(await this.loadData());
    this.registerView(ARCADE_VIEW_TYPE, (leaf) => new ArcadeView(leaf, this));
    const ribbonIcon = this.addRibbonIcon('gamepad-2', 'Open game library', () => void this.activateView());
    ribbonIcon.addClass('arcade-ribbon-icon');
    this.addCommand({
      id: 'open',
      name: 'Open game library',
      icon: 'gamepad-2',
      callback: () => void this.activateView(),
    });
    this.registerEvent(
      this.app.workspace.on('active-leaf-change', (leaf) => this.updateActiveArcadeView(leaf)),
    );
  }

  public getArcadeData(): ArcadeDataV1 {
    return this.data;
  }

  public async updateArcadeData(update: (data: ArcadeDataV1) => ArcadeDataV1): Promise<void> {
    this.data = parseArcadeData(update(this.data));
    const snapshot = this.data;
    this.saveQueue = this.saveQueue.then(() => this.saveData(snapshot));
    await this.saveQueue;
  }

  private async activateView(): Promise<void> {
    let leaf = this.app.workspace.getLeavesOfType(ARCADE_VIEW_TYPE)[0];
    if (leaf === undefined) {
      leaf = this.app.workspace.getLeaf('tab');
      await leaf.setViewState({ type: ARCADE_VIEW_TYPE, active: true });
    }

    await this.app.workspace.revealLeaf(leaf);
    this.updateActiveArcadeView(leaf);
  }

  private updateActiveArcadeView(activeLeaf: WorkspaceLeaf | null): void {
    for (const leaf of this.app.workspace.getLeavesOfType(ARCADE_VIEW_TYPE)) {
      if (leaf.view instanceof ArcadeView) {
        leaf.view.setActive(leaf === activeLeaf);
      }
    }
  }
}
