import React, { useState, useEffect } from 'react';
import './App.css';

function Loading() {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading...</p>
    </div>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [taskForm, setTaskForm] = useState({
    title: '',
    priority: 'Medium',
    time: '',
    status: 'Pending',
  });
  const [tasks, setTasks] = useState([]);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    priority: 'Medium',
    time: '',
    status: 'Pending',
  });
  const [selectAll, setSelectAll] = useState(false);

  const [loadedFromStorage, setLoadedFromStorage] = useState(false);

  useEffect(() => {
    const storedTasks = localStorage.getItem('daily-task-manager-tasks');
    if (storedTasks) {
      try {
        setTasks(JSON.parse(storedTasks));
      } catch (error) {
        console.warn('Invalid saved tasks', error);
      }
    }

    setLoadedFromStorage(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loadedFromStorage) {
      return;
    }

    localStorage.setItem('daily-task-manager-tasks', JSON.stringify(tasks));
  }, [tasks, loadedFromStorage]);

  useEffect(() => {
    setSelectAll(tasks.length > 0 && tasks.every((task) => task.selected));
  }, [tasks]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!taskForm.title.trim() || !taskForm.time) {
      return;
    }

    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        selected: false,
        ...taskForm,
      },
    ]);

    setTaskForm({
      title: '',
      priority: 'Medium',
      time: '',
      status: 'Pending',
    });
  };

  const handleToggleSelect = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, selected: !task.selected } : task
      )
    );
  };

  const handleToggleSelectAll = () => {
    const nextSelect = !(tasks.length > 0 && tasks.every((task) => task.selected));
    setTasks((prev) => prev.map((task) => ({ ...task, selected: nextSelect })));
    setSelectAll(nextSelect);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const startEditing = (task) => {
    setEditingTaskId(task.id);
    setEditForm({
      title: task.title,
      priority: task.priority,
      time: task.time,
      status: task.status,
    });
  };

  const saveEdit = (taskId) => {
    if (!editForm.title.trim() || !editForm.time) {
      return;
    }

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, ...editForm }
          : task
      )
    );
    setEditingTaskId(null);
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
  };

  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const deleteSelected = () => {
    setTasks((prev) => prev.filter((task) => !task.selected));
  };

  const markSelectedDone = () => {
    setTasks((prev) =>
      prev.map((task) =>
        task.selected ? { ...task, status: 'Done' } : task
      )
    );
  };

  const totalTasks = tasks.length;
  const doneCount = tasks.filter((task) => task.status === 'Done').length;
  const pendingCount = tasks.filter((task) => task.status === 'Pending').length;
  const inProgressCount = tasks.filter((task) => task.status === 'In Progress').length;
  const completionRate = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;
  const selectedCount = tasks.filter((task) => task.selected).length;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="App page-shell">
      <div className="page-card">
        <header className="page-header">
          <div>
            <h1>Daily Task Manager</h1>
            <p>Save tasks locally, edit them inline, and track progress visually.</p>
          </div>
          <button className="primary-button" onClick={() => document.getElementById('task-title')?.focus()}>
            Add Task
          </button>
        </header>

        <div className="stats-grid">
          <section className="progress-card">
            <div className="progress-card-header">
              <div>
                <h2>Progress Overview</h2>
                <p>{totalTasks} total tasks</p>
              </div>
              <div className="chart-ring" style={{ '--progress': `${completionRate}%` }}>
                <span>{completionRate}%</span>
              </div>
            </div>

            <div className="progress-bars">
              <div className="progress-line">
                <span>Done</span>
                <strong>{doneCount}</strong>
                <div className="bar">
                  <div className="bar-fill done" style={{ width: `${totalTasks ? (doneCount / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="progress-line">
                <span>In Progress</span>
                <strong>{inProgressCount}</strong>
                <div className="bar">
                  <div className="bar-fill progress" style={{ width: `${totalTasks ? (inProgressCount / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="progress-line">
                <span>Pending</span>
                <strong>{pendingCount}</strong>
                <div className="bar">
                  <div className="bar-fill pending" style={{ width: `${totalTasks ? (pendingCount / totalTasks) * 100 : 0}%` }} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="task-form-card">
          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit} className="task-form">
            <label>
              Title
              <input
                id="task-title"
                type="text"
                name="title"
                value={taskForm.title}
                onChange={handleChange}
                placeholder="Task title"
              />
            </label>

            <label>
              Priority
              <select name="priority" value={taskForm.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </label>

            <label>
              Time
              <input
                type="time"
                name="time"
                value={taskForm.time}
                onChange={handleChange}
              />
            </label>

            <label>
              Status
              <select name="status" value={taskForm.status} onChange={handleChange}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </label>

            <button type="submit" className="primary-button">
              Add Task
            </button>
          </form>
        </section>

        <section className="task-list-card">
          <div className="section-header section-actions">
            <div>
              <h2>Tasks</h2>
              <p>{totalTasks} total · {selectedCount} selected</p>
            </div>
            <div className="task-actions-header">
              <label className="select-all">
                <input type="checkbox" checked={selectAll} onChange={handleToggleSelectAll} />
                Select All
              </label>
              <button className="secondary-button" onClick={markSelectedDone} disabled={selectedCount === 0}>
                Mark Selected Done
              </button>
              <button className="secondary-button danger" onClick={deleteSelected} disabled={selectedCount === 0}>
                Delete Selected
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <p className="empty-state">No tasks added yet. Fill the form above and tap Add Task.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.selected ? 'task-selected' : ''}`}>
                  <div className="task-checkbox">
                    <input
                      type="checkbox"
                      checked={task.selected || false}
                      onChange={() => handleToggleSelect(task.id)}
                    />
                  </div>

                  {editingTaskId === task.id ? (
                    <div className="task-edit-row">
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditChange}
                      />
                      <select name="priority" value={editForm.priority} onChange={handleEditChange}>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                      <input
                        type="time"
                        name="time"
                        value={editForm.time}
                        onChange={handleEditChange}
                      />
                      <select name="status" value={editForm.status} onChange={handleEditChange}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <div className="edit-buttons">
                        <button type="button" className="secondary-button" onClick={() => saveEdit(task.id)}>
                          Save
                        </button>
                        <button type="button" className="secondary-button" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="task-main">
                        <p className="task-title">{task.title}</p>
                        <span className={`badge badge-${task.priority.toLowerCase().replace(' ', '-')}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="task-meta">
                        <span>{task.time}</span>
                        <span>{task.status}</span>
                      </div>
                      <div className="task-item-actions">
                        <button className="link-button" onClick={() => startEditing(task)}>
                          Edit
                        </button>
                        <button className="link-button danger" onClick={() => deleteTask(task.id)}>
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
