import { Request, Response } from "express";
import { createTodo, getAllTodos, modifyTodo, getAllFalses, getAllFromUser } from "../controllers/TodoController";
import Todo from "../models/Todo";
import { JwtPayload } from "jsonwebtoken";

jest.mock("../models/Todo");

describe("Todo Controller Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    statusMock = jest.fn().mockReturnThis();
    jsonMock = jest.fn();
    sendMock = jest.fn();

    res = {
      status: statusMock,
      json: jsonMock,
      send: sendMock,
    };
  });

  describe("createTodo", () => {
    it("should create a new todo and return 201", async () => {
      req = {
        headers: { payload: JSON.stringify({ id: "test-user-id" }) },
        body: { task: "Test todo creation" }
      };

      (Todo.create as jest.Mock).mockResolvedValue({
        id: 1,
        task: "Test todo creation",
        userId: "test-user-id",
        completed: false
      });

      await createTodo(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(sendMock).toHaveBeenCalledWith({
        id: 1,
        task: "Test todo creation",
        userId: "test-user-id",
        completed: false
      });
    });

    it("should return 400 if 'task' is missing", async () => {
      req = {
        headers: { payload: JSON.stringify({ id: "test-user-id" }) },
        body: {}
      };

      await createTodo(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(sendMock).toHaveBeenCalledWith({ message: "champs task requis" });
    });
  });

  describe("getAllTodos", () => {
    it("should retrieve all todos with status 200", async () => {
      (Todo.findAll as jest.Mock).mockResolvedValue([
        { id: 1, task: "Test todo 1", completed: false },
        { id: 2, task: "Test todo 2", completed: true }
      ]);

      req = {};
      await getAllTodos(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(sendMock).toHaveBeenCalledWith([
        { id: 1, task: "Test todo 1", completed: false },
        { id: 2, task: "Test todo 2", completed: true }
      ]);
    });
  });

  describe("modifyTodo", () => {
    it("should update todo and return 200", async () => {
      req = {
        params: { id: "1" }
      };

      const mockTodo = {
        id: 1,
        task: "Complete this task",
        completed: false,
        save: jest.fn().mockResolvedValue(true)
      };
      
      (Todo.findByPk as jest.Mock).mockResolvedValue(mockTodo);

      await modifyTodo(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Todo mise à jour avec succès",
        data: { ...mockTodo, completed: true }
      });
      expect(mockTodo.save).toHaveBeenCalled();
    });

    it("should return 404 if todo not found", async () => {
      (Todo.findByPk as jest.Mock).mockResolvedValue(null);
      req = { params: { id: "99" } };

      await modifyTodo(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Todo non trouvée" });
    });
  });

  describe("getAllFalses", () => {
    it("should retrieve incomplete todos with status 200", async () => {
      (Todo.findAll as jest.Mock).mockResolvedValue([
        { id: 1, task: "Incomplete task 1", completed: false }
      ]);

      req = {};
      await getAllFalses(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith([
        { id: 1, task: "Incomplete task 1", completed: false }
      ]);
    });
  });

  describe("getAllFromUser", () => {
    it("should retrieve user's todos", async () => {
      req = {
        headers: { payload: JSON.stringify({ id: "user-1" }) }
      };

      (Todo.findAll as jest.Mock).mockResolvedValue([
        { id: 1, task: "User's todo", userId: "user-1", completed: false }
      ]);

      await getAllFromUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith({
        message: "Tâches de l'utilisateur user-1",
        todos: [{ id: 1, task: "User's todo", userId: "user-1", completed: false }]
      });
    });

    it("should return 400 for incorrect payload", async () => {
      req = { headers: { payload: "" } };

      await getAllFromUser(req as Request, res as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ message: "Payload incorrect" });
    });
  });
});
