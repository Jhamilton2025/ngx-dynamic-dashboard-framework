import { Component, OnInit, ViewChild } from '@angular/core';
import {
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

import { ImageComponent } from '../gadgets/image/image.component';
import { BoardGridDirective } from './boardgrid.directive';
import { ProductComponent } from '../gadgets/product/product.component';
import { EventService } from '../eventservice/event.service';
import { IEvent } from '../menu/menu.event.model';
import { IBoardManager, BoardManager } from './boardmanager';
import { BoardService, IBoard } from './board.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
})
export class BoardComponent implements OnInit {
  @ViewChild(BoardGridDirective, { static: true })
  gadgetGridHost!: BoardGridDirective;

  boardData: any;
  isEmpty: boolean;
  boardManager: IBoardManager;

  constructor(
    private eventService: EventService,
    private boardService: BoardService
  ) {
    this.isEmpty = false;
    this.boardManager = new BoardManager(this.boardService, this.eventService);
    this.setupConfigurationTabsBoardCompletionEventListener();
    //this.setupBoardNavigationCompletionEventListner();
  }

  ngOnInit(): void {
    this.displayBoard();
  }

  /**
   * Event Listners
   */
  setupConfigurationTabsBoardCompletionEventListener() {
    this.eventService
      .listenForConfigurationCompletedEvents()
      .subscribe((event: IEvent) => {
        const edata = event['data'];

        switch (event['name']) {
          case 'boardCreateCompletedEvent':
          case 'boardEditCompletedEvent':
          case 'boardDeleteCompletedEvent':
            this.displayBoard();
            break;
        }
      });
  }

  /*
  setupBoardNavigationCompletionEventListener() {
    this.eventService
      .listenForBoardNavigationCompletionEvents()
      .subscribe((event: IEvent) => {
        const edata = event['data'];

        switch (event['name']) {
          case 'boardSelectCompleted':
            this.displayBoard();
            break;
        }
      });
  }
*/
  /**
   * Board Display Section
   */
  displayBoard() {
    let me = this;

    //getBoardData
    this.boardManager.loadBoardData().subscribe((_boardData: IBoard[]) => {
      me.prepareBoardDataForDisplay(_boardData);
    });
  }

  prepareBoardDataForDisplay(data: IBoard[]) {
    //TODO - display the board where the last selected flag is set
    this.createAndDisplayGadgetInstances(data);
  }

  createAndDisplayGadgetInstances(data: IBoard[]) {
    const gridHost = this.gadgetGridHost.viewContainerRef;
    gridHost.clear();

    //use the data from the board to set the flag
    console.log(data);
    this.isEmpty = false;

    if (!this.isEmpty) {
      //todo create a gadget based on the incoming data
      gridHost.createComponent(ProductComponent);
      gridHost.createComponent(ImageComponent);
    }

    //set instance config
  }

  getColumnIndexAsString(idx: number) {
    return '' + idx;
  }


  /**
   *
   * Drag and Drop support
   */
  drop(event: CdkDragDrop<string[]>) {
    //console.log(event);
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }
    this.updateDataModel(event.container, event.previousContainer);
  }
  updateDataModel(container: CdkDropList, previousContainer: CdkDropList) {
    let cIdx = parseInt(container.id);
    let pIdx = parseInt(previousContainer.id);

    //this means a component was moved from one column to another
    if (cIdx != pIdx) {
      this.boardData[pIdx].gadgetNames = previousContainer.data;
    }

    this.boardData[cIdx].gadgetNames = container.data;

    //persist the change
    this.boardManager.save(this.boardData);
  }

}
