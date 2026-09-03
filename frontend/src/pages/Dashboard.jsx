import { useEffect, useState } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const emptyForm = {
  title: '',
  description: '',
  date: '',
  time: '',
};

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [aiSchedule, setAiSchedule] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);

  /*
   * REAL APPLICATION EVENT-LOOP EXAMPLE
   *
   * This function fetches tasks asynchronously.
   *
   * api.get() returns a Promise.
   *
   * When execution reaches `await`, the async function yields
   * while the HTTP request is pending instead of blocking
   * JavaScript's main call stack.
   *
   * After the Promise resolves, execution after `await`
   * continues through Promise microtask processing.
   */
  const fetchTasks = async () => {
    try {
      const response = await api.get('/tasks');

      // This executes after the Axios Promise resolves.
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    /*
     * Axios performs this network request asynchronously.
     *
     * The HTTP request does not keep the JavaScript call stack blocked.
     *
     * `.then()`, `.catch()` and `.finally()` are Promise reactions,
     * so their callbacks execute through the microtask queue
     * after the corresponding Promise settles.
     */
    api
      .get('/tasks')
      .then((response) => {
        if (isActive) {
          setTasks(response.data);
        }
      })
      .catch((error) => {
        if (isActive) {
          console.error('Failed to fetch tasks:', error);
        }
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, form);
      } else {
        await api.post('/tasks', form);
      }

      setForm(emptyForm);
      setEditingId(null);

      await fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleGetAiSchedule = async () => {
    try {
      setAiLoading(true);

      const taskTitles = tasks
        .map((task) => task.title)
        .join(', ');

      const response = await api.post(
        '/ai/suggest-schedule',
        {
          tasks: taskTitles,
        }
      );

      setAiSchedule(response.data);
    } catch (error) {
      console.error('AI Error:', error);
    } finally {
      setAiLoading(false);
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
    if (!window.confirm('Delete this task?')) {
      return;
    }

    try {
      await api.delete(`/tasks/${id}`);

      await fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });

      await fetchTasks();
    } catch (error) {
      console.error(
        'Failed to update task:',
        error
      );
    }
  };

  const grouped = tasks.reduce(
    (groups, task) => {
      const day =
        task.date?.slice(0, 10) || 'No date';

      if (!groups[day]) {
        groups[day] = [];
      }

      groups[day].push(task);

      return groups;
    },
    {}
  );

  return (
    <div>
      <Navbar />

      <div
        className="ai-section"
        style={{
          margin: '20px 0',
          padding: '15px',
          border: '1px solid #ccc',
        }}
      >
        <h3>AI Schedule Assistant</h3>

        <button
          onClick={handleGetAiSchedule}
          disabled={
            aiLoading || tasks.length === 0
          }
        >
          {aiLoading
            ? 'Generating Schedule...'
            : 'Suggest Schedule'}
        </button>

        {aiSchedule.length > 0 && (
          <div style={{ marginTop: '15px' }}>
            <h4>Suggested Plan:</h4>

            <ul>
              {aiSchedule.map(
                (item, index) => (
                  <li key={index}>
                    <strong>
                      {item.taskTitle}
                    </strong>{' '}
                    - {item.suggestedTime}{' '}
                    (Priority:{' '}
                    {item.priorityLevel})
                  </li>
                )
              )}
            </ul>
          </div>
        )}
      </div>

      <div
        style={{
          maxWidth: 600,
          margin: '30px auto',
          padding: '0 16px',
        }}
      >
        <h2>
          {editingId
            ? 'Edit Task'
            : 'Add Task'}
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ marginBottom: 30 }}
        >
          <input
            name="title"
            placeholder="Title"
            value={form.title}
            onChange={handleChange}
            required
            style={{
              display: 'block',
              width: '100%',
              marginBottom: 8,
              padding: 8,
            }}
          />

          <textarea
            name="description"
            placeholder="Description (optional)"
            value={form.description}
            onChange={handleChange}
            style={{
              display: 'block',
              width: '100%',
              marginBottom: 8,
              padding: 8,
            }}
          />

          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            style={{
              marginRight: 8,
              padding: 8,
            }}
          />

          <input
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            style={{
              marginRight: 8,
              padding: 8,
            }}
          />

          <button
            type="submit"
            style={{ padding: 8 }}
          >
            {editingId
              ? 'Update Task'
              : 'Add Task'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                padding: 8,
                marginLeft: 8,
              }}
            >
              Cancel
            </button>
          )}
        </form>

        <h2>Your Schedule</h2>

        {loading && <p>Loading...</p>}

        {!loading &&
          tasks.length === 0 && (
            <p>
              No tasks yet. Add one above.
            </p>
          )}

        {Object.keys(grouped)
          .sort()
          .map((day) => (
            <div
              key={day}
              style={{ marginBottom: 20 }}
            >
              <h3>{day}</h3>

              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {grouped[day].map(
                  (task) => (
                    <li
                      key={task._id}
                      style={{
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'space-between',
                        padding:
                          '8px 10px',
                        border:
                          '1px solid #ddd',
                        borderRadius: 6,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems:
                            'center',
                          gap: 10,
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            task.completed
                          }
                          onChange={() =>
                            toggleComplete(
                              task
                            )
                          }
                        />

                        <div>
                          <div
                            style={{
                              textDecoration:
                                task.completed
                                  ? 'line-through'
                                  : 'none',
                            }}
                          >
                            <strong>
                              {task.time &&
                                `${task.time} — `}
                              {task.title}
                            </strong>
                          </div>

                          {task.description && (
                            <div
                              style={{
                                fontSize: 13,
                                color:
                                  '#666',
                              }}
                            >
                              {
                                task.description
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <button
                          onClick={() =>
                            startEdit(task)
                          }
                          style={{
                            marginRight: 6,
                          }}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteTask(
                              task._id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}
