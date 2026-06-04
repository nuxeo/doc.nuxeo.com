/*
 * (C) Copyright 2019 Nuxeo (http://nuxeo.com/) and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Contributors:
 *     Kevin Leturc <kleturc@nuxeo.com>
 *     Manon Lumeau <mlumeau@nuxeo.com>
 */

import org.kohsuke.github.GHRepository
import org.kohsuke.github.GitHubBuilder
import org.yaml.snakeyaml.DumperOptions
@Grab("org.yaml:snakeyaml:1.16")
import org.yaml.snakeyaml.Yaml

properties([
  [$class: 'BuildDiscarderProperty', strategy: [$class: 'LogRotator', daysToKeepStr: '60', numToKeepStr: '60', artifactNumToKeepStr: '1']],
  disableConcurrentBuilds(),
  [$class: 'RebuildSettings', autoRebuild: false, rebuildDisabled: false],
  parameters([
    choice(name: 'REPOSITORY', description: 'Doc repository to release', choices: ['doc.nuxeo.com-client-java']),
    string(name: 'ORIGIN_BRANCH', description: 'Origin Branch', defaultValue: 'master'),
    string(name: 'VERSION', description: 'New version to release'),
    string(name: 'TICKET', description: 'Jira ticket to use for commits'),
    booleanParam(name: 'DRY_RUN', description: 'Try to upgrade the repository without committing', defaultValue: false),
  ]),
])

node('SLAVEPRIV') {
  def docRepositoryName = env.REPOSITORY
  def originBranch = env.ORIGIN_BRANCH
  def targetBranch = env.VERSION
  def targetVersion = env.VERSION
  def techno = docRepositoryName.replaceFirst('.*-client-(.+)', '$1')
  def githubCredential = "c203b7ce-203b-4fcb-81eb-8e1cae7cb6c2"
  def docRepository = getGithubRepository(githubCredential, docRepositoryName)
  stage('create branch') {
    createBranch(docRepository, originBranch, targetBranch, env.DRY_RUN)

    updateYamlConfigAndPush(docRepository, targetBranch, "Make ${targetVersion} version live", env.TICKET, env.DRY_RUN) { configYml ->
      def versions = configYml.default.site.versions
      def branchVersionIdx = versions.findIndexOf { it.label == "Next Version" }
      // can't use interpolation here, otherwise snakeyaml will have difficulties
      versions[branchVersionIdx].label = techno.capitalize() + ' ' + targetVersion
      versions[branchVersionIdx].url_path = targetVersion
    }
  }
  stage('update master') {
    updateYamlConfigAndPush(docRepository, originBranch, "Add new ${targetVersion} version", env.TICKET, env.DRY_RUN) { configYml ->
      // version to insert
      def version = [label: techno.capitalize() + ' ' + targetVersion, url_path: targetVersion]

      // look for the ongoing version
      def versions = configYml.default.site.versions
      def branchVersionIdx = versions.findIndexOf { it.label == "Next Version" }

      if (branchVersionIdx == versions.size() - 1) {
        versions.add(version)
      } else {
        versions.add(branchVersionIdx + 1, version)
      }
      configYml.default.site.versions = versions
    }
  }
  stage('update other branches') {
    def branches = docRepository.getBranches().findAll { key, value -> key.matches('\\d+\\.\\d+') && key != targetVersion }
    branches.each { key, value ->
      updateYamlConfigAndPush(docRepository, key, "Add ${targetVersion} version to existing ones", env.TICKET, env.DRY_RUN) { configYml ->
        // version to insert
        def version = [label: techno.capitalize() + ' ' + targetVersion, url_path: targetVersion]
        configYml.default.site.versions.add(0, version)
      }
    }
  }
  stage('update doc.nuxeo.com repository') {
    def mainRepository = getGithubRepository(githubCredential, "doc.nuxeo.com")
    def branchToCreate = "update-${techno}-client-${targetVersion}"
    createBranch(mainRepository, 'master', branchToCreate, env.DRY_RUN)

    // update configuration
    updateYamlConfigAndPush(mainRepository, branchToCreate, "Add new ${targetVersion} ${techno} client version", env.TICKET, env.DRY_RUN) { configYml ->
      def branches = configYml.default.repositories[techno].branches
      // increase previous order version
      branches.each { key, value -> value.order += 10 }
      // insert the new version
      branches.put(targetVersion, [label: targetVersion, url_path: targetVersion, order: 0])
    }
    // update redirects
    updateFileAndPush(mainRepository, branchToCreate, "redirects_default.yml", "Update ${techno} client redirect", env.TICKET, env.DRY_RUN) { redirects ->
      return redirects.replaceAll("target: /${techno}/.*/", "target: /${techno}/${targetVersion}/")
    }
    // create PR
    println "Create PR from branch: ${branchToCreate} to: master on: ${mainRepository.getName()}"
    if (!env.DRY_RUN) {
      mainRepository.createPullRequest(
        "Update configuration for ${techno.capitalize()} Client ${targetVersion}",
        branchToCreate,
        'master',
        "PR created by ${env.BUILD_URL}")
    }
  }
}

//@NonCPS
GHRepository getGithubRepository(githubCredential, repository) {
  def ghBuilder = new GitHubBuilder()
    .withEndpoint("https://api.github.com")
//    .withConnector(new HttpConnectorWithJenkinsProxy())

  withCredentials([string(credentialsId: githubCredential, variable: 'GH_TOKEN')]) {
    ghBuilder.withOAuthToken(env.GH_TOKEN)
  }

  return ghBuilder.build().getRepository('nuxeo/' + repository)
}

//@NonCPS
def createBranch(GHRepository repository, originBranch, targetBranch, dryRun) {
  println "Create branch: ${targetBranch} from branch: ${originBranch} on: ${repository.getName()}"
  if (!dryRun) {
    repository.createRef("refs/heads/${targetBranch}", repository.getBranch(originBranch).getSHA1())
  }
}

//@NonCPS
def updateYamlConfigAndPush(GHRepository repository, branch, commitMsg, ticket, dryRun, Closure modifier) {
  updateFileAndPush(repository, branch, "config.yml", commitMsg, ticket, dryRun) { content ->
    def yamlOptions = new DumperOptions()
    yamlOptions.setDefaultFlowStyle(DumperOptions.FlowStyle.BLOCK)
    def yamlMapper = new Yaml(yamlOptions)
    def configYml = yamlMapper.load(content)

    modifier(configYml)

    return yamlMapper.dump(configYml)
  }
}

def updateFileAndPush(GHRepository repository, branch, filename, commitMsg, ticket, dryRun, Closure modifier) {
  def ticketPrefix = ticket ? "${ticket}: " : ""
  def withTicketSuffix = ticket ? " with ticket: ${ticket}" : ""

  def b = repository.getBranch(dryRun ? repository.getDefaultBranch() : branch)
  def ghConfigContent = repository.getFileContent(filename, b.getSHA1())
  def configContent = ghConfigContent.read().text

  configContent = modifier(configContent)

  println "Commit and push file: ${filename} on branch: ${branch}" + withTicketSuffix + " on: ${repository.getName()}"
  if (!dryRun) {
    ghConfigContent.update(configContent, "${ticketPrefix}${commitMsg}", branch)
  }
}
