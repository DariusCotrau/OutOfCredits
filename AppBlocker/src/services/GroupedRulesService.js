/**
 * Serviciu pentru reguli grupate (ex: "Social Media" = Instagram + TikTok + Facebook).
 * Permite setarea unei limite de timp comune pentru un grup de aplicații.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, APP_CATEGORIES, KNOWN_PACKAGES } from '../utils/constants';

/**
 * @typedef {Object} GroupedRule
 * @property {string} id
 * @property {string} groupName - Numele grupului (ex: "Social Media")
 * @property {string[]} packageNames - Lista de pachete incluse
 * @property {number} timeLimitMinutes - Limita de timp combinată
 * @property {boolean} isActive
 * @property {string} createdAt
 */

/**
 * Creează o regulă grupată.
 * @param {string} groupName
 * @param {string[]} packageNames
 * @param {number} timeLimitMinutes
 * @returns {GroupedRule}
 */
export const createGroupedRule = (groupName, packageNames, timeLimitMinutes) => ({
  id: `group_${groupName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`,
  groupName,
  packageNames,
  timeLimitMinutes,
  isActive: true,
  createdAt: new Date().toISOString(),
});

/**
 * Încarcă toate regulile grupate.
 * @returns {Promise<GroupedRule[]>}
 */
export const loadGroupedRules = async () => {
  const json = await AsyncStorage.getItem(STORAGE_KEYS.GROUPED_RULES);
  if (!json) return [];
  return JSON.parse(json);
};

/**
 * Salvează regulile grupate.
 * @param {GroupedRule[]} rules
 */
export const saveGroupedRules = async (rules) => {
  await AsyncStorage.setItem(STORAGE_KEYS.GROUPED_RULES, JSON.stringify(rules));
};

/**
 * Adaugă o regulă grupată.
 * @param {GroupedRule} rule
 * @returns {Promise<GroupedRule[]>}
 */
export const addGroupedRule = async (rule) => {
  const rules = await loadGroupedRules();
  rules.push(rule);
  await saveGroupedRules(rules);
  return rules;
};

/**
 * Șterge o regulă grupată.
 * @param {string} ruleId
 * @returns {Promise<GroupedRule[]>}
 */
export const removeGroupedRule = async (ruleId) => {
  const rules = await loadGroupedRules();
  const filtered = rules.filter((r) => r.id !== ruleId);
  await saveGroupedRules(filtered);
  return filtered;
};

/**
 * Verifică dacă un grup a depășit limita pe baza utilizării combinate.
 * @param {GroupedRule} rule
 * @param {Object.<string, number>} usageMap - Map packageName -> usedTimeMs
 * @returns {{isExceeded: boolean, combinedUsageMs: number, remainingMs: number}}
 */
export const checkGroupedRuleStatus = (rule, usageMap) => {
  const combinedUsageMs = rule.packageNames.reduce(
    (sum, pkg) => sum + (usageMap[pkg] || 0),
    0
  );
  const limitMs = rule.timeLimitMinutes * 60 * 1000;

  return {
    isExceeded: rule.isActive && combinedUsageMs >= limitMs,
    combinedUsageMs,
    remainingMs: Math.max(0, limitMs - combinedUsageMs),
  };
};

/**
 * Sugerează un grup predefinit pe baza categoriei.
 * @param {string} category - Una din APP_CATEGORIES
 * @returns {{groupName: string, packageNames: string[]}|null}
 */
export const getSuggestedGroup = (category) => {
  const packages = KNOWN_PACKAGES[category];
  if (!packages || packages.length === 0) return null;
  return {
    groupName: category,
    packageNames: packages,
  };
};
