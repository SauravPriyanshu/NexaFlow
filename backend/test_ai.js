async function test() {
  try {
    const codeSnippet = `task.projectId}/kanban\`)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.15s' }}
                  className="hover:bg-bg-card-hover"
                >
                  <div style={{ width: '8px', height: '10px', borderRadius: '50%', background:`;

    const res = await fetch('http://localhost:5000/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'explain',
        input: {
          language: 'Other',
          codeInputs: { JavaScript: '', Other: codeSnippet },
          question: '',
          result: null,
          code: codeSnippet
        }
      })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err.message);
  }
}

test();
