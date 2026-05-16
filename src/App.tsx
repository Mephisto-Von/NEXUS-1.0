import { useState, useEffect } from 'react';
import styled from 'styled-components';
import * as tauri from '@/utils/tauri';
import type { ModelProfile, TaskSummary, Stats, SecurityInfo, AgentType } from '@/types';
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

const Main = styled.main`
  min-height: 100vh;
`;

export function App() {
  const [booted, setBooted] = useState(false);
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

  useEffect(() => {
    loadData();
  }, []);

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
      setOllamaRunning(modelData.available.length > 0);
      setOllamaCount(modelData.available.length);
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
      await tauri.createTask(prompt, selectedModels, selectedMode);
      addActivity('system', 'Task queued');
      loadData();
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
    if (confirm('Securely wipe all data? This cannot be undone.')) {
      await tauri.wipeAllData();
      setTasks([]);
      setStats({ total: 0, completed: 0, running: 0, failed: 0, avg_duration_ms: 0 });
      addActivity('system', 'All data securely wiped');
    }
  }

  return (
    <>
      {!booted && <BootSequence onComplete={() => setBooted(true)} />}
      <Cursor />
      <Overlays />
      <Nav />
      <Main>
        <Terminal
          onSubmit={handleSubmitTask}
          selectedModels={selectedModels}
          setSelectedModels={setSelectedModels}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          availableModels={models}
        />
        <ModelCards
          models={allModels}
          availableTags={new Set(models.map(m => m.tag))}
          onPull={handlePullModel}
        />
        <ActivityFeed activities={activities} />
        <TaskList tasks={tasks} />
        <ResultViewer />
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
