import React, { useState, useEffect } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import "./TodoList.css";

const TodoList = () => {
	const [todos, setTodos] = useState([]);
	const [title, setTitle] = useState("");
	const [alertMessage, setAlertMessage] = useState("");

	useEffect(() => {
		fetch("http://localhost:9000/todos")
			.then((response) => response.json())
			.then((data) => setTodos(data));
	}, []);

	const addTodo = async () => {
		if (title.trim() === "") {
			setAlertMessage("Please enter a task.");
			setTimeout(() => setAlertMessage(""), 3000); // Hide alert after 3 seconds
			return;
		}

		const response = await fetch("http://localhost:9000/todos", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ title, completed: false }),
		});
		const newTodo = await response.json();
		setTodos([...todos, newTodo]);
		setTitle("");
		setAlertMessage("Todo added successfully!");
		setTimeout(() => setAlertMessage(""), 3000); // Hide alert after 3 seconds
	};

	const toggleTodo = async (id, completed) => {
		const response = await fetch(`http://localhost:9000/todos/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ completed: !completed }),
		});
		const updatedTodo = await response.json();
		setTodos(todos.map((todo) => (todo.id === id ? updatedTodo : todo)));
	};

	const deleteTodo = async (id) => {
		await fetch(`http://localhost:9000/todos/${id}`, {
			method: "DELETE",
		});
		setTodos(todos.filter((todo) => todo.id !== id));
		setAlertMessage("Todo deleted successfully!");
		setTimeout(() => setAlertMessage(""), 3000); // Hide alert after 3 seconds
	};

	return (
		<HelmetProvider>
			<div>
				<Helmet>
					<title>Todo App</title>
				</Helmet>
				<div className="todo-title">
					<h1>Todo List</h1>
				</div>

				{alertMessage && <div className="alert">{alertMessage}</div>}
				<div className="todo-form">
					<input
						type="text"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Enter new task"
					/>
					<button onClick={addTodo}>Add Todo</button>
				</div>
				{todos.length === 0 ? (
					<p>No available tasks.</p>
				) : (
					<ul>
						{todos.map((todo) => (
							<li key={todo.id}>
								<span
									style={{
										textDecoration: todo.completed
											? "line-through"
											: "none",
									}}
									onClick={() =>
										toggleTodo(todo.id, todo.completed)
									}
								>
									{todo.title}
								</span>
								<button onClick={() => deleteTodo(todo.id)}>
									Delete
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</HelmetProvider>
	);
};

export default TodoList;
