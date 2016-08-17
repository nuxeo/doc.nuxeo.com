---
title: Nuxeo Documentation Center Home
shortlink-source: 'https://doc.nuxeo.com/x/Sgg7'
shortlink: Sgg7
no_side_menu: true

layout: default.hbs
---

1. Some text
    Text to follow.

    [a link](http://www.google.com)

2. The next number
    {{#> callout type='tip' }}

    For the examples below, let's say you are using Ubuntu 14.04 LTS ("trusty") and want to install the Nuxeo latest Fast Track release (from the "fasttracks" APT repository; for&nbsp;LTS you would replace "fasttracks" with "releases").

    {{/callout}}

3. I love the third item.
    ```xml
    <?xml version="1.0"?>
    <fragment version="1">

      <require>org.nuxeo.ecm.platform.lang</require>

    </fragment>

    ```

    And some text

4. May the fourth be with you
    {{#> panel type='code' heading='my-code.xml'}}
    ```xml
    <?xml version="1.0"?>
    <fragment version="1">

      <require>org.nuxeo.ecm.platform.lang</require>

    </fragment>

    ```
    {{/panel}}

5. Number 5 is a live!
    {{#> callout type='tip' }}

    If you don't have `add-apt-repository`, which is a non-standard command, issue the following commands:

    `sudo echo "deb http://apt.nuxeo.org/$(lsb_release -cs) releases" > /etc/apt/sources.list.d/nuxeo.list`

    `sudo echo "deb [http://apt.nuxeo.org/](http://apt.nuxeo.org/) &nbsp;$(lsb_release -cs) fasttracks" >> /etc/apt/sources.list.d/nuxeo.list`

    {{/callout}}

<div class="row" data-equalizer="" data-equalize-on="medium">
<div class="column medium-6">{{#> panel type='secondary' match_height='true'}}

### Quick Start Guides

This section is intended to providing you with end-to-end recipes for achieving your customization goals of the Nuxeo Platform.

- [Bootstrap Your Document Management Project](/nxdoc/bootstrap-your-document-management-project)
- [Bootstrap Your Case Management Project](/nxdoc/bootstrap-your-case-management-project)
- [Quick Start Dev Guide](/nxdoc/quick-start-dev-guide)

{{/panel}}</div>
<div class="column medium-6">{{#> panel type='secondary' match_height='true'}}

### Developer Documentation

This section will explain you the setup of the Nuxeo Platform and what you can do and how you can customize and extend it.

- [Installation](/nxdoc/installation)
- [REST API](/nxdoc/rest-api)
- [Tutorials](/nxdoc/tutorials)

{{/panel}}</div>
</div>
<div class="row" data-equalizer="" data-equalize-on="medium">
<div class="column medium-6">{{#> panel type='secondary' match_height='true'}}

### User Documentation

Step-by-step instructions for using our product.

- [Nuxeo Platform Concepts](/userdoc/nuxeo-platform-concepts)
- [Picture, Video, Sound: Nuxeo Digital Asset Management (DAM)](/userdoc/picture-video-sound-nuxeo-digital-asset-management-dam)
- [Case Management with the Nuxeo Platform](/userdoc/case-management-with-the-nuxeo-platform)
- [Managing Your Nuxeo Application](/userdoc/managing-your-nuxeo-application)

{{/panel}}
</div>
<div class="column medium-6">{{#> panel type='secondary' match_height='true'}}

### Core Developer Guide

This guide is intended for "core developers", developers who intend to build the Nuxeo platform from the source, build it, change parts of it, contribute changes or patches.

- [Developer Environment Setup](/corg/developer-environment-setup)
- [Development Tools and Process](/corg/development-tools-and-process)
- [Coding and Design Guidelines](/corg/coding-and-design-guidelines)

{{/panel}}</div>
</div>

{{!-- unmigrated-inline-wiki-markup: {multi-excerpt:name=apt-repo-install-UI} {note} This requires X11. {note} # Edit the "Software sources": using the Unity Dash, running "\{{gksudo software-properties-gtk}}", or browsing the "\{{System/Administration/Software Sources}}" Gnome 2 menu. # Download [the Nuxeo key|http://apt.nuxeo.org/nuxeo.key] and import it in the "Authentication" tab. # Add the Nuxeo APT repository: on the "Other Software" tab, add "\{{deb http://apt.nuxeo.org/ trusty releases}}" and "\{{deb http://apt.nuxeo.org/ trusty fasttracks}}" to the sources. (if you're using another version of Ubuntu, replace trusty by the adequate name, for instance *raring* for Ubuntu 13.04) # Click on that link to install Nuxeo: {html}[apt://nuxeo](apt://nuxeo){html}. # Follow the instructions displayed. If it's your first install, you can configure: #* the bind address, #* the port, #* the database (a preconfigured PostgreSQL database is suggested by default). The platform is installed as a service. It is automatically started and set to automatically start at boot. # Open a browser and type the URL [http://localhost:8080/nuxeo/]. The [startup wizard|Setup#Setup-wizard] is displayed so you can setup your Nuxeo platform and select the module you want to install.{multi-excerpt} --}}