import { nullSafeIsEquivalent } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IEvent, EventService } from '../eventservice/event.service';

export interface IBoard {
  title: string;
  description: string;
  structure: string;
  lastSelected: boolean;
  id: number;
  boardInstanceId: number;
  rows: any;
}

export interface IGadget{

}

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  BOARD: string = 'board';

  constructor(private eventService: EventService) {
    this.setupConfigurationEventListeners();
  }

  /**
   * Event Listners
   */
  private setupConfigurationEventListeners() {
    this.eventService
      .listenForBoardCreateRequestEvent()
      .subscribe((event: IEvent) => {
        this.createNewBoard(event);
      });

    this.eventService
      .listenForBoardDeleteRequestEvent()
      .subscribe((event: IEvent) => {
        this.deleteBoard(event);
      });
  }

  private read() {
    return localStorage.getItem(this.BOARD);
  }

  public save(boardData: any) {
    localStorage.removeItem(this.BOARD);
    localStorage.setItem(this.BOARD, JSON.stringify(boardData));
  }

  private getBoardData(): IBoard[] {
    if (this.read() == null) {
      return []; //TODO this will not work if there is additional default boards added. FIXME
    } else {
      let _data = this.read();
      if (_data == null) {
        _data = '';
      }
      return JSON.parse(_data);
    }
  }

  private getAllDefaultBoardData(): IBoard[] {
    return [
      {
        title: 'Board',
        description: '',
        structure: '1-1',
        lastSelected: true,
        id: -1,
        boardInstanceId: -1,
        rows: [
          {
            columns: [
              {
                styleClass: '1fr',
                gadgets: [],
                gadgetNames: [],
              },
              {
                styleClass: '1fr',
                gadgets: [],
                gadgetNames: [],
              },
            ],
          },
        ],
      },
    ];
  }

  private getDefaultBoard(type: number) {
    let defaultBoardsArray = this.getAllDefaultBoardData();
    return defaultBoardsArray[type]; //currently only one default board type which is 0 exists
  }

  public getBoards() {
    return new Observable<IBoard[]>((observer) => {
      observer.next(this.getBoardData());
      return () => {};
    });
  }

  public getLastSelectedBoard() {
    return new Observable<IBoard>((observer) => {
      let data = this.getBoardData();

      if (data.length == 0) {

        observer.next({
          title: '',
          description: '',
          structure: '',
          lastSelected: false,
          id: -10,
          boardInstanceId: -10,
          rows: {},
        });
        return () => {};
      } else {

        //in case we cannot find the last selected return the first in the list.
        let lastSelectedBoard = data[0];

        data.forEach((board) => {
          if (board.lastSelected == true) {
            lastSelectedBoard = board;
          }
        });
        observer.next(lastSelectedBoard);
        return () => {};
      }
    });
  }
  public getNavSelectedBoard(_boardData:IEvent) {
    return new Observable<IBoard>((observer) => {
      let data = this.getBoardData();

      if (data.length == 0) {

        observer.next({
          title: '',
          description: '',
          structure: '',
          lastSelected: false,
          id: -10,
          boardInstanceId: -10,
          rows: {},
        });
        return () => {};
      } else {

        //in case we cannot find the last selected return the first in the list.
        let selectedBoard:IBoard = data[0];

        data.forEach((board) => {
          if (board.title == _boardData.data) {
            board.lastSelected = true;
            selectedBoard = board;
          }else{
            board.lastSelected = false;
          }
        });
        observer.next(selectedBoard);
        return () => {};
      }
    });
  }
  private createNewBoard(event: IEvent): void {
    console.log('CREATE BOARD REQUEST PROCESS START');
    /**
     * TODO do the work using the board service and then
     * (1) retreive the current board data
     * (2) retrieve a default board instance
     * (3) clear last selected property from (1)
     * (3) update the default board data info from event/request
     * (4) update the saved information with the new entry
     * (5) persist back to storage
     * (6) raise completion event or error event
     * */

    this.getBoards().subscribe((savedBoardsData: IBoard[]) => {

      //(1)
      let defaultBoardInstanceRequestData = this.getDefaultBoard(0); //currently only one default board type

      //(2)
      let editedSavedBoardsData = savedBoardsData.map((boardInstance) => {
        if (boardInstance.lastSelected === true) {
          return { ...boardInstance, lastSelected: false };
        }
        return boardInstance;
      });

      //(3)
      defaultBoardInstanceRequestData.lastSelected = true;
      defaultBoardInstanceRequestData.id = Date.now();
      defaultBoardInstanceRequestData.title = event.data['title'];
      defaultBoardInstanceRequestData.description = event.data['description'];

      //(4)
      let newBoardDataSet = [
        ...editedSavedBoardsData,
        defaultBoardInstanceRequestData,
      ];

      //(5)
      this.save(newBoardDataSet);

      //(6)
      this.eventService.emitBoardCreatedCompleteEvent({
        data: defaultBoardInstanceRequestData,
      });
      console.log('CREATE BOARD REQUEST PROCESS COMPLETE');
    });
  }

  private deleteBoard(event: IEvent) {
    console.log('DELETE BOARD REQUEST PROCESS START');
    /**
     * TODO do the work using the board service and then
     * (1) retreive the current board data
     * (2) find the board to delete
     * (3) if board is lastSelected set the last selected to another board???
     * (4) persist back to storage
     * (5) raise completion event or error event
     * */

    this.getBoards().subscribe((savedBoardsData: IBoard[]) => {

      let idx = savedBoardsData.findIndex(
        (board) => board.id === event.data['id']
      );

      savedBoardsData.splice(idx, 1);

      this.save(savedBoardsData);

    });

    this.eventService.emitBoardDeletedCompleteEvent({ data: event });

    console.log('DELETE BOARD REQUEST PROCESS COMPLETE');
  }

  addGadgetToBoard(board:IBoard, gadget:IGadget){

  }


  deleteGadgetFromBoard(board:IBoard, gadget:IGadget){


  }
}
