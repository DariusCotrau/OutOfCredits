/**
 * Serviciu de persistență pentru regulile de blocare.
 * Folosește AsyncStorage pentru a salva/încărca configurațiile.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@AppBlocker:blockRules';

/**
 * Salvează lista de reguli de blocare.
 * @param {BlockRule[]} rules
 */
export const saveBlockRules = async (rules) => {
  const json = JSON.stringify(rules);
  await AsyncStorage.setItem(STORAGE_KEY, json);
};

/**
 * Încarcă lista de reguli de blocare.
 * @returns {Promise<BlockRule[]>}
 */
export const loadBlockRules = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  return JSON.parse(json);
};

/**
 * Adaugă o regulă nouă la lista existentă.
 * @param {BlockRule} rule
 */
export const addBlockRule = async (rule) => {
  const rules = await loadBlockRules();
  rules.push(rule);
  await saveBlockRules(rules);
  return rules;
};

/**
 * Șterge o regulă după ID.
 * @param {string} ruleId
 */
export const removeBlockRule = async (ruleId) => {
  const rules = await loadBlockRules();
  const filtered = rules.filter((r) => r.id !== ruleId);
  await saveBlockRules(filtered);
  return filtered;
};

/**
 * Actualizează o regulă existentă.
 * @param {string} ruleId
 * @param {Partial<BlockRule>} updates
 */
export const updateBlockRule = async (ruleId, updates) => {
  const rules = await loadBlockRules();
  const index = rules.findIndex((r) => r.id === ruleId);
  if (index === -1) throw new Error(`Rule ${ruleId} not found`);
  rules[index] = { ...rules[index], ...updates };
  await saveBlockRules(rules);
  return rules;
};

/**
 * Șterge toate regulile.
 */
export const clearAllRules = async () => {
  await AsyncStorage.removeItem(STORAGE_KEY);
};
