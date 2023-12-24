import { contextBridge, Menu, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
const util = require('util')
const exec = util.promisify(require('child_process').exec)

// Custom APIs for renderer
const DisplayName = 'B4PH'
const api = {
  isActiveNFWR: async function () {
    // 규칙 활성화 여부 확인
    const getNFWR = `Get-NetFirewallRule -DisplayName "${DisplayName}"`
    const { error, result, stdout } = await runPowerShell(getNFWR)
    const isEnabledResultText = NSWRStdOutParser(stdout, 'Enabled')
    let isEnabled = isEnabledResultText == 'True' ? true : false
    return isEnabled
  },
  createOrActiveNFWR: async function () {
    // 규칙이 있다면 활성화 하고, 없다면 생성
    const getNFWR = `Get-NetFirewallRule -DisplayName "${DisplayName}"`
    const { error, result, stdout } = await runPowerShell(getNFWR)

    if (result) {
      const enableNFWR = `Enable-NetFirewallRule -DisplayName "${DisplayName}"`
      let eResult = await runPowerShell(enableNFWR)
      return eResult.result
    } else {
      const createNFWR = `New-NetFirewallRule -DisplayName "${DisplayName}" -Direction Outbound -Protocol ICMPv4 -Action Block`
      let eResult = await runPowerShell(createNFWR)
      return eResult.result
    }
  },
  disableNFWR: async function () {
    // 규칙 비활성화
    const disableNFWR = `Disable-NetFirewallRule -DisplayName "${DisplayName}"`
    let eResult = await runPowerShell(disableNFWR)
    return eResult.result
  },
  removeNFWR: async function () {
    // 규칙 삭제
    const removeNFWR = `Remove-NetFirewallRule -DisplayName "${DisplayName}"`
    let eResult = await runPowerShell(removeNFWR)
    return eResult.result
  },
  contextMenu: function () {
    ipcRenderer.send('show-context-menu')
  },
  openLink: function () {
    require('shell').openExternal('http://www.google.com')
  }
}
async function runPowerShell(powershellScript) {
  // PowerShell 스크립트 실행
  try {
    const { error, stdout, stderr } = await exec(
      `chcp 65001 | powershell -Command "${powershellScript}"`,
      { encoding: 'UTF-8' }
    )
    console.log('stdout :', stdout)
    console.log('stderr :', stderr)
    return {
      result: true,
      stdout
    }
  } catch (error) {
    console.log('error :', error)
    return {
      result: false,
      error
    }
  }
}
function NSWRStdOutParser(stdout, key) {
  const lines = stdout.split('\r\n')
  for (const line of lines) {
    console.log(line)
    if (line.startsWith(key)) {
      return line.split(':')[1].trim()
    }
  }
}
// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
