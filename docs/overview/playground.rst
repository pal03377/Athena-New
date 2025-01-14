Playground
==========

Welcome to the Athena Playground Interface, a versatile tool designed for developing, testing, and evaluation Athena modules. This document provides an overview of the Playground's features, illustrating its capabilities and how to use them effectively.

Base Configuration
------------------

The Base Configuration section is your starting point in the Athena Playground. Here, you connect to the Athena instance, monitor the health status of Athena and its modules, and set up your working environment. You can switch between example and evaluation datasets, and choose between Module Requests and Evaluation Mode for varied testing experiences.

.. figure:: ../images/playground/base_info_header.png
    :width: 500px
    :alt: Base Info Header Interface of the Athena Playground

    Base Info Header Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40949?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_BaseInfoHeader on TUM-Live.
    </iframe>

Module Requests
---------------

This section is designed to test individual requests to Athena modules, allowing you to observe and understand their responses in isolation. First, select a healthy module from the dropdown menu. Then, you can optionally choose to use a custom configuration for all subsequent requests. Afterward, you can test the following requests.

.. figure:: ../images/playground/module_requests/select_module.png
    :width: 500px
    :alt: Module Requests Select Module Interface of the Athena Playground

    Module Requests: Select Module Interface of the Athena Playground

Get Config Schema
^^^^^^^^^^^^^^^^^

This feature enables you to fetch and view the JSON configuration schema of a module. It's a critical tool for understanding the expected runtime configuration options for different modules, ensuring seamless integration and functioning with your system.

.. figure:: ../images/playground/module_requests/get_config_schema.png
    :width: 500px
    :alt: Get Config Schema Request Interface of the Athena Playground

    Module Requests: Get Config Schema Request Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40950?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_GetConfigSchema on TUM-Live.
    </iframe>

Send Submissions
^^^^^^^^^^^^^^^^

Send Submissions is a key feature for pushing exercise materials and submissions to Athena modules. It's a foundational step, allowing modules to process and analyze data for later.

.. figure:: ../images/playground/module_requests/send_submissions.png
    :width: 500px
    :alt: Send Submissions Request Interface of the Athena Playground
    
    Module Requests: Send Submissions Request Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40951?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_SendSubmissions on TUM-Live.
    </iframe>

Select Submission
^^^^^^^^^^^^^^^^^

Selecting submissions is crucial for improving the efficiency of generated feedback suggestions. This feature allows modules to propose a specific submissions, which can then be used to generate feedback suggestions. For instance, CoFee uses this to select the submission with the highest information gain so it can generate more relevant feedback suggestions for the remaining submissions.


.. figure:: ../images/playground/module_requests/request_submission_selection.png
    :width: 500px
    :alt: Select Submission Request Interface of the Athena Playground
    
    Module Requests: Select Submission Request Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40952?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_SelectSubmission on TUM-Live.
    </iframe>

Send Feedback
^^^^^^^^^^^^^

Send Feedback enables the transmission of (tutor) feedback to Athena modules. This feature is pivotal in creating a learning loop, where modules can refine their responses based on real feedback.


.. figure:: ../images/playground/module_requests/send_feedback.png
    :width: 500px
    :alt: Send Feedback Request Interface of the Athena Playground

    Module Requests: Send Feedback Request Interface of the Athena Playground
    
.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40954?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_SendFeedback on TUM-Live.
    </iframe>

Generate Feedback Suggestions
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

This function is at the heart of Athena's feedback mechanism. It responds with generated feedback suggestions for a given submission.

.. figure:: ../images/playground/module_requests/generate_suggestions.png
    :width: 500px
    :alt: Generate Feedback Suggestions Request Interface of the Athena Playground

    Module Requests: Generate Feedback Suggestions Request Interface of the Athena Playground
   
.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40955?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_GenerateSuggestions on TUM-Live.
    </iframe>

Request Evaluation
^^^^^^^^^^^^^^^^^^

Request Evaluation is essential for assessing the quality of feedback provided by Athena modules. It allows the comparison between module-generated feedback and historical tutor feedback, offering a quantitative analysis of the module's performance.

.. figure:: ../images/playground/module_requests/evaluation.png
    :width: 500px
    :alt: Evaluation Request Interface of the Athena Playground

    Module Requests: Evaluation Request Interface of the Athena Playground
    
.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40956?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_Evaluation on TUM-Live.
    </iframe>

Evaluation Mode
---------------

Evaluation Mode enables comprehensive evaluation and comparison of different modules through experiments.


Define Experiment
^^^^^^^^^^^^^^^^^

Define Experiment allows you to set up and customize experiments. You can choose execution modes, exercise types, and manage training and evaluation data, laying the groundwork for in-depth structured module comparison and analysis. Experiments can be exported and imported, allowing you to reuse and share them with others as benchmarks.


.. figure:: ../images/playground/evaluation_mode/define_experiment.png
    :width: 500px
    :alt: Define Experiment Interface of the Athena Playground

    Evaluation Mode: Define Experiment Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40957?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_DefineExperiment on TUM-Live.
    </iframe>

Configure Modules
^^^^^^^^^^^^^^^^^

Here, you can select and configure the modules for your experiment. This step is crucial for ensuring that each module is set up with the appropriate parameters for effective comparison and analysis. Module configurations can be exported and imported, allowing you to reuse them in other experiments and share them with others for reproducibility.

.. figure:: ../images/playground/evaluation_mode/configure_modules.png
    :width: 500px
    :alt: Configure Modules Interface of the Athena Playground

    Evaluation Mode: Configure Modules Interface of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40959?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_ConfigureModules on TUM-Live.
    </iframe>

Conduct Experiment
^^^^^^^^^^^^^^^^^^

You can conduct experiments with modules on exercises. This feature allows you to analyze module performance in generating and evaluating feedback on submissions. The interface is column-based, with the first column displaying the exercise details, the second column displaying the selected submission with historical feedback, and the next columns displaying the generated feedback suggestions from each module.

Currently, only the batch mode is supported, where all submissions are processed at once and the following steps are performed:
1. Send submissions
2. Send feedback for training submissions if there are any
3. Generate feedback suggestions for all evaluation submissions
4. Run automatic evaluation

Additionally, you can annotate the generated feedback suggestions like a tutor would do in the Artemis interface with: ``Accept`` or ``Reject``.

The ``results``, ``manual ratings``, and ``automatic evaluation`` can be exported and imported, allowing you to analyze and visualize the results in other tools, or continue the experiment at a later time.

For Text Exercises
""""""""""""""""""

.. figure:: ../images/playground/evaluation_mode/conduct_experiment_text.png
    :width: 500px
    :alt: Conduct Experiment Interface for a Text Exercise of the Athena Playground

    Evaluation Mode: Conduct Experiment Interface for a Text Exercise of the Athena Playground

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40960?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_ConductExperimentText on TUM-Live.
    </iframe>

For Programming Exercises
"""""""""""""""""""""""""

.. raw:: html

    <iframe src="https://live.rbg.tum.de/w/artemisintro/40961?video_only=1&t=0" allowfullscreen="1" frameborder="0" width="600" height="350">
        Video version of Athena_ConductExperimentProgramming on TUM-Live.
    </iframe>

Expert Evaluation
-----------------
**Expert Evaluation** is the process where a researcher enlists experts to assess the quality of feedback provided on student submissions.
These experts evaluate how well the feedback aligns with the content of the submissions and predefined metrics such as accuracy, tone, and adaptability.
The goal is to gather structured and reliable assessments to improve feedback quality or validate feedback generation methods.

The playground provides two key Expert Evaluation views:

1. Researcher View: Enables researchers to configure the evaluation process, define metrics, and generate expert links.
2. Expert View: Allows experts to review feedback and rate its quality based on the defined evaluation metrics.

Researcher View
^^^^^^^^^^^^^^^
Researcher View is accessible from the playground below Evaluation Mode:

.. figure:: ../images/playground/expert_evaluation/researcher_view_location.png
    :width: 500px
    :alt: Location of the Researcher View

The researcher begins creating a new Expert Evaluation by selecting a new name and uploading exercises with submissions and feedback.

Now the expert can define his own metrics such as actionability, accuracy and add a short and a long description.
Based on these metrics, experts will compare the different feedback types.

.. figure:: ../images/playground/expert_evaluation/define_metrics.png
    :width: 500px
    :alt: Defining metrics

Afterwards, the researcher adds a link for each expert participating in the evaluation.
This link should then be shared with the corresponding expert.
After finishing the configuration, the researcher can define the experiment and start the Expert Evaluation.

.. figure:: ../images/playground/expert_evaluation/define_experiment.png
    :width: 500px
    :alt: Define experiment

.. warning::
    Once the evaluation has started, the exercises and the metrics can no longer be changed!
    However, additional expert links can be created.

Instead of uploading the exercises and defining the metrics separately, the researcher can also import an existing configuration at the top of the Researcher View.

After the evaluation has been started and the experts have begun to evaluate, the researcher can track each expert's progress by clicking the Update Progress button.
Evaluation results can be exported at any time during the evaluation using the Download Results button.

.. figure:: ../images/playground/expert_evaluation/view_expert_evaluation_progress.png
    :width: 500px
    :alt: View Expert Evaluation progress

Expert View
^^^^^^^^^^^
The Expert View can be accessed through generated expert links.
The Side-by-Side tool is used for evaluation.

.. figure:: ../images/playground/expert_evaluation/side-by-side-tool.png
    :width: 500px
    :alt: Side-by-Side tool

First time clicking on the link, the expert is greeted by a welcome screen, where the tutorial begins.
The following steps are shown and briefly described:

The expert firstly reads the exercise details to get familiar with the exercise.
The details include the problem statement, grading instructions, and a sample solution.

.. raw:: html

    <iframe src="../../playground/public/exercise_details.mp4" allowfullscreen="1" frameborder="0" width="600" height="350">
        Read exercise details
    </iframe>

After understanding the exercise, the expert reads through the submission and the corresponding feedback.

.. raw:: html

    <iframe src="../../playground/public/read_submission.mp4" allowfullscreen="1" frameborder="0" width="600" height="350">
        Read submission
    </iframe>

The expert then evaluates the feedback using a 5-point Likert scale based on the previously defined metrics.

.. raw:: html

    <iframe src="../../playground/public/evaluation_metrics.mp4" allowfullscreen="1" frameborder="0" width="600" height="350">
        Evaluate metrics
    </iframe>

If the meaning of a metric is unclear, a more detailed explanation can be accessed by clicking the info icon or the Metric Details button.

.. raw:: html

    <iframe src="../../playground/public/metrics_explanation.mp4" allowfullscreen="1" frameborder="0" width="600" height="350">
        Read metrics explanation
    </iframe>

After evaluating all the different types of feedback, the expert can move on to the next submissions and repeat the process.
When ready to take a break, the expert clicks on the Continue Later button which saves their progress.

.. raw:: html

    <iframe src="../../playground/public/continue_later.mp4" allowfullscreen="1" frameborder="0" width="600" height="350">
        Continue later
    </iframe>
