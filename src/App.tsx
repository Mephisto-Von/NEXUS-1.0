import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as tauri from '@/utils/tauri';
import type { ModelProfile, TaskSummary, Stats, SecurityInfo, AgentType, Task } from '@/types';
import { BootSequence } from '@/components/BootSequence';
import { Cursor, Overlays } from '@/components/Cursor';
import { Nav } from '@/components/Nav';
import { Terminal } from '@/components/Terminal';
import { ModelCards } from '@/components/ModelCards';
import { ActivityFeed } from '@/components/ActivityFeed';
import { TaskList } from '@/components/TaskList';
import { ResultViewer } from '@/components/ResultViewer';
import { StatsBar } from '@/components/StatsBar';
import { Footer } from '@/components/Footer';
import { LoginPortal } from '@/components/LoginPortal';

const Main = styled.main`
  min-height: 100vh;
`;

export function App() {
  const [booted, setBooted] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; avatarUrl: string } | null>(null);
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [allModels, setAllModels] = useState<ModelProfile[]>([]);
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, running: 0, failed: 0, avg_duration_ms: 0 });
  const [activities, setActivities] = useState<{ type: AgentType; message: string; time: string }[]>([]);
  const [ollamaRunning, setOllamaRunning] = useState(false);
  const [ollamaCount, setOllamaCount] = useState(0);
  const [securityInfo, setSecurityInfo] = useState<SecurityInfo | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('collaborative');
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  // Sync available models status
  useEffect(() => {
    if (models.length > 0) {
      setOllamaRunning(true);
      setOllamaCount(models.length);
    } else {
      setOllamaRunning(false);
      setOllamaCount(0);
    }
  }, [models]);

  // Handle active task polling (alive state synchronization)
  useEffect(() => {
    const hasActiveTask = tasks.some(t => 
      ['queued', 'decomposing', 'executing', 'voting', 'synthesizing', 'reviewing'].includes(t.status)
    );

    if (hasActiveTask) {
      const interval = setInterval(() => {
        loadData();
        if (selectedTaskId) {
          loadSelectedTask(selectedTaskId);
        }
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [tasks, selectedTaskId]);

  // Load selected task details on change
  useEffect(() => {
    if (selectedTaskId) {
      loadSelectedTask(selectedTaskId);
    } else {
      setSelectedTask(null);
    }
  }, [selectedTaskId]);

  async function loadData() {
    try {
      const [modelData, taskData, statData, secInfo] = await Promise.all([
        tauri.getModels().catch(() => ({ available: [], all: [] })),
        tauri.listTasks().catch(() => ({ tasks: [] })),
        tauri.getStats().catch(() => ({ stats: { total: 0, completed: 0, running: 0, failed: 0, avg_duration_ms: 0 } })),
        tauri.getSecurityInfo().catch(() => null),
      ]);
      setModels(modelData.available);
      setAllModels(modelData.all);
      setTasks(taskData.tasks);
      setStats(statData.stats);
      setSecurityInfo(secInfo);
      
      // Auto select the first task on initial boot if available
      if (taskData.tasks.length > 0 && !selectedTaskId) {
        setSelectedTaskId(taskData.tasks[0].id);
      }
    } catch {}
  }

  async function loadSelectedTask(id: string) {
    try {
      const res = await tauri.getTask(id);
      setSelectedTask(res.task);
      
      // Map task logs directly to live agent activity feed
      if (res.task && res.task.logs && res.task.logs.length > 0) {
        const mapped = res.task.logs.map(log => ({
          type: log.type as AgentType,
          message: log.message,
          time: new Date(log.timestamp).toTimeString().slice(0, 8),
        }));
        setActivities(mapped.reverse());
      }
    } catch {}
  }

  function addActivity(type: AgentType, message: string) {
    setActivities(prev => [{
      type,
      message,
      time: new Date().toTimeString().slice(0, 8),
    }, ...prev].slice(0, 50));
  }

  async function handleSubmitTask(prompt: string) {
    try {
      addActivity('system', 'Deploying agents...');
      const res = await tauri.createTask(prompt, selectedModels, selectedMode);
      addActivity('system', 'Task queued');
      
      setSelectedTaskId(res.taskId);
      await loadData();
    } catch (err: any) {
      addActivity('system', `Error: ${err.message || err}`);
    }
  }

  async function handleSendFollowUp(followUpPrompt: string) {
    if (!selectedTask) return;
    try {
      addActivity('system', 'Deriving session enclave signature and deploying follow-up directive...');
      const combinedPrompt = `[FOLLOW-UP ON DIRECTIVE ${selectedTask.id.slice(0, 8).toUpperCase()}]\n\nNavigator request: ${followUpPrompt}`;
      const res = await tauri.createTask(combinedPrompt, selectedTask.models, selectedTask.mode);
      addActivity('system', 'Follow-up queued');
      
      setSelectedTaskId(res.taskId);
      await loadData();
    } catch (err: any) {
      addActivity('system', `Error: ${err.message || err}`);
    }
  }

  async function handlePullModel(tag: string) {
    try {
      await tauri.pullModel(tag);
      await loadData();
      addActivity('system', `Pulled ${tag}`);
    } catch {}
  }

  async function handleWipeData() {
    if (confirm('Securely wipe all encrypted task history? This cannot be undone.')) {
      await tauri.wipeAllData();
      setTasks([]);
      setSelectedTaskId(null);
      setSelectedTask(null);
      setStats({ total: 0, completed: 0, running: 0, failed: 0, avg_duration_ms: 0 });
      setActivities([]);
      addActivity('system', 'All encrypted data securely wiped from disk');
    }
  }

  if (booted && !user) {
    return (
      <>
        <Cursor />
        <LoginPortal onLogin={setUser} />
      </>
    );
  }

  return (
    <>
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      <Cursor />
      <Overlays />
      <Nav user={user} />
      <Main>
        <Terminal
          onSubmit={handleSubmitTask}
          selectedModels={selectedModels}
          setSelectedModels={setSelectedModels}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          availableModels={allModels.filter(m => m.tier === 'online' || models.some(x => x.tag === m.tag))}
        />
        <ModelCards
          models={allModels}
          availableTags={new Set([...models.map(m => m.tag), ...allModels.filter(m => m.tier === 'online').map(m => m.tag)])}
          onPull={handlePullModel}
        />
        <ActivityFeed activities={activities} />
        <TaskList 
          tasks={tasks} 
          selectedTaskId={selectedTaskId}
          onSelectTask={setSelectedTaskId}
        />
        <ResultViewer 
          task={selectedTask}
          onSendFollowUp={handleSendFollowUp}
        />
        <StatsBar stats={stats} />
      </Main>
      <Footer
        ollamaRunning={ollamaRunning}
        ollamaCount={ollamaCount}
        securityInfo={securityInfo}
        onWipe={handleWipeData}
      />
    </>
  );
}
