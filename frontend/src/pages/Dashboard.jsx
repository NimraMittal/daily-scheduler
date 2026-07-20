import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const emptyForm = { title: '', description: '', date: '', time: '' };

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, form);
      } else {
        await api.post('/tasks', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      date: task.date?.slice(0, 10) || '',
      time: task.time || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // group tasks by date for a schedule-style view
  const grouped = tasks.reduce((acc, task) => {
    const day = task.date?.slice(0, 10) || 'No date';
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: 600, margin: '30px auto', padding: '0 16px' }}>
        <h2>{editingId ? 'Edit Task' : 'Add Task'}</h2>
        <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
          />
          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }}
          />
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            style={{ marginRight: 8, padding: 8 }}
          />
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            style={{ marginRight: 8, padding: 8 }}
          />
          <button type="submit" style={{ padding: 8 }}>
            {editingId ? 'Update Task' : 'Add Task'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} style={{ padding: 8, marginLeft: 8 }}>
              Cancel
            </button>
          )}
        </form>

        <h2>Your Schedule</h2>
        {loading && <p>Loading...</p>}
        {!loading && tasks.length === 0 && <p>No tasks yet. Add one above.</p>}

        {Object.keys(grouped).sort().map((day) => (
          <div key={day} style={{ marginBottom: 20 }}>
            <h3>{day}</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {grouped[day].map((task) => (
                <li
                  key={task._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleComplete(task)}
                    />
                    <div>
                      <div style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
                        <strong>{task.time && `${task.time} — `}{task.title}</strong>
                      </div>
                      {task.description && <div style={{ fontSize: 13, color: '#666' }}>{task.description}</div>}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => startEdit(task)} style={{ marginRight: 6 }}>Edit</button>
                    <button onClick={() => deleteTask(task._id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}