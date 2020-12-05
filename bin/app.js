#!/usr/bin/env node
const path = require("path");
const commander = require("commander");
const program = commander.program;
const inquirer = require("inquirer");
const ora = require("ora");
const shelljs = require("shelljs");
const fs = require("fs");
let spinner;

program
  .command("info", "show project info");

program
  .command('init <dir>')
  .description('init project')
  .option('-d, --desctiption [projectname]', 'project description')
  .action(function (dir, cmdObj) {
    // 项目文件名称
    const des = cmdObj.desctiption;
    // 设置项目描述
    inquirer.prompt([
      {
        type: "confirm",
        message: "是否设置项目描述？",
        name: "hasDes",
        when: function () {
          return !des;
        }
      },
      {
        type: "input",
        message: "请输入项目描述",
        name: "description",
        when: function (answers) {
          return answers.hasDes
        }
      },
      {
        type: "checkbox",
        message: "请选择项目版本",
        name: "version",
        choices: [
          { name: "1.0.0", checked: true },
          { name: "2.0.0" },
          new inquirer.Separator(),/**添加分隔符 */
        ]
      }
    ]).then(answers => {
      spinner = ora(' ⏰ 正在加载，请稍后.....').start();
      spinner.color = 'green';
      const indexDir = process.cwd();
      const description = des || answers.description;
      const version = answers.version;
      const oldPro = 'node-mvc';
      shelljs.cd(indexDir);
      shelljs.mkdir(dir);
      shelljs.cd(dir);
      if (shelljs.exec('git clone "https://github.com/SunlightLH/node-mvc.git"').code !== 0) {
        shelljs.echo('😢 Error: Git clone failed');
        spinner.stop();
        shelljs.exit(1);
      } else {
        const totlaPath = path.resolve(indexDir, dir, );
        shelljs.cp('-r', oldPro+'/*', './');
        shelljs.rm("-rf",oldPro)
        shelljs.echo('🐩 Success: Git clone success!');
        spinner.color = 'yellow';
        spinner.text = '🐍 开始更新用户配置....';
        let json = require(totlaPath + "/package.json");
        json.version = version[0] || "1.0.0";
        json.description = description;
        json.name = dir;
        fs.writeFile(totlaPath + "/package.json", JSON.stringify(json), 'utf8', function (error) {
          if (error) {
            spinner.stop();
            console.log(error);
            shelljs.exit(1);
          }
          spinner.stop();
          console.log('😸 配置成功！');
          shelljs.exit(0);
        })
      };
    })
      .catch(error => {
        if (spinner) {
          spinner.stop();
        }
        console.error(error)
        process.exit(1);
      });
  });

program.parse(process.argv);