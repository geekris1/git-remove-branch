#!/usr/bin/env node

const prompts = require('prompts');
const { execSync } = require('child_process');

// 获取命令行参数
const args = process.argv.slice(2);

// 检查是否在git仓库中
function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// 获取本地分支列表
function getLocalBranches() {
  try {
    const output = execSync('git branch --format="%(refname:short)"', { encoding: 'utf8' });
    return output.trim().split('\n').filter(branch => branch.length > 0);
  } catch (error) {
    console.error('获取本地分支失败:', error.message);
    return [];
  }
}

// 获取远程分支列表
function getRemoteBranches(verbose = false) {
  try {
    // 先获取远程分支的最新信息并清理已删除的远程分支引用
    execSync('git fetch --prune', { stdio: 'pipe' });

    // 获取实际存在的远程分支
    const output = execSync('git branch -r --format="%(refname:short)"', { encoding: 'utf8' });
    const branches = output.trim().split('\n')
      .filter(branch => branch.length > 0 && !branch.includes('HEAD'))
      .map(branch => branch.replace('origin/', ''));

    // 进一步验证分支是否真的存在于远程
    const validBranches = [];
    for (const branch of branches) {
      try {
        // 检查远程分支是否真的存在
        execSync(`git ls-remote --heads origin ${branch}`, { stdio: 'pipe' });
        validBranches.push(branch);
      } catch (error) {
        // 如果分支不存在，跳过
        if (verbose) {
          console.log(`⚠️  跳过已删除的远程分支: ${branch}`);
        }
      }
    }

    return validBranches;
  } catch (error) {
    console.error('获取远程分支失败:', error.message);
    return [];
  }
}

// 删除本地分支
function deleteLocalBranch(branchName) {
  try {
    execSync(`git branch -d ${branchName}`, { stdio: 'pipe' });
    console.log(`✅ 本地分支 '${branchName}' 删除成功`);
    return true;
  } catch (error) {
    console.error(`❌ 删除本地分支 '${branchName}' 失败:`, error.message);
    return false;
  }
}

// 删除远程分支
function deleteRemoteBranch(branchName) {
  try {
    execSync(`git push origin --delete ${branchName}`, { stdio: 'pipe' });
    console.log(`✅ 远程分支 '${branchName}' 删除成功`);
    return true;
  } catch (error) {
    console.error(`❌ 删除远程分支 '${branchName}' 失败:`, error.message);
    return false;
  }
}

// 主函数
async function main() {
  // 检查是否在git仓库中
  if (!isGitRepository()) {
    console.error('❌ 当前目录不是git仓库');
    process.exit(1);
  }

  let branchType = null;
  let branches = [];

  // 检查命令行参数
  if (args.includes('local')) {
    branchType = 'local';
    branches = getLocalBranches();
  } else if (args.includes('remote')) {
    branchType = 'remote';
    branches = getRemoteBranches(true); // 显示详细信息
  } else {
    // 交互式选择分支类型
    const response = await prompts({
      type: 'select',
      name: 'branchType',
      message: '请选择要管理的分支类型:',
      choices: [
        { title: '本地分支', value: 'local' },
        { title: '远程分支', value: 'remote' }
      ]
    });

    if (!response.branchType) {
      console.log('操作已取消');
      return;
    }

    branchType = response.branchType;
  }

  // 获取分支列表
  if (branches.length === 0) {
    if (branchType === 'local') {
      branches = getLocalBranches();
    } else {
      branches = getRemoteBranches(false); // 交互模式下不显示详细信息
    }
  }

  if (branches.length === 0) {
    console.log(`没有找到${branchType === 'local' ? '本地' : '远程'}分支`);
    return;
  }

  // 过滤掉当前分支（本地分支）
  if (branchType === 'local') {
    try {
      const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      branches = branches.filter(branch => branch !== currentBranch);
    } catch (error) {
      // 忽略错误
    }
  }

  if (branches.length === 0) {
    console.log(`没有可删除的${branchType === 'local' ? '本地' : '远程'}分支`);
    return;
  }

  // 选择要删除的分支（支持多选）
  const branchResponse = await prompts({
    type: 'multiselect',
    name: 'selectedBranches',
    message: `请选择要删除的${branchType === 'local' ? '本地' : '远程'}分支:`,
    choices: branches.map(branch => ({
      title: branch,
      value: branch
    })),
    hint: '使用空格键选择/取消选择，回车确认'
  });

  if (!branchResponse.selectedBranches || branchResponse.selectedBranches.length === 0) {
    console.log('操作已取消');
    return;
  }

  const selectedBranches = branchResponse.selectedBranches;

  // 显示选中的分支
  console.log(`\n已选择以下${branchType === 'local' ? '本地' : '远程'}分支:`);
  selectedBranches.forEach(branch => {
    console.log(`  - ${branch}`);
  });

  // 确认删除
  const confirmResponse = await prompts({
    type: 'confirm',
    name: 'confirmed',
    message: `确定要删除这 ${selectedBranches.length} 个${branchType === 'local' ? '本地' : '远程'}分支吗?`,
    initial: false
  });

  if (!confirmResponse.confirmed) {
    console.log('操作已取消');
    return;
  }

  // 执行批量删除操作
  console.log(`\n开始删除 ${selectedBranches.length} 个分支...\n`);

  let successCount = 0;
  let failCount = 0;

  for (const branch of selectedBranches) {
    let success = false;
    if (branchType === 'local') {
      success = deleteLocalBranch(branch);
    } else {
      success = deleteRemoteBranch(branch);
    }

    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }

  // 显示删除结果
  console.log(`\n删除完成:`);
  console.log(`✅ 成功删除: ${successCount} 个分支`);
  if (failCount > 0) {
    console.log(`❌ 删除失败: ${failCount} 个分支`);
  }
}

// 处理未捕获的异常
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  process.exit(1);
});

// 运行主函数
main().catch(error => {
  console.error('程序执行出错:', error);
  process.exit(1);
}); 